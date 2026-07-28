import { Test, type TestingModule } from '@nestjs/testing';

import { EmailPasswordResetLinkJob } from 'src/engine/core-modules/auth/jobs/email-password-reset-link.job';
import { ResetPasswordService } from 'src/engine/core-modules/auth/services/reset-password.service';

describe('EmailPasswordResetLinkJob', () => {
  let job: EmailPasswordResetLinkJob;
  let resetPasswordService: ResetPasswordService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailPasswordResetLinkJob,
        {
          provide: ResetPasswordService,
          useValue: {
            generatePasswordResetToken: jest.fn(),
            invalidatePasswordResetToken: jest.fn(),
            savePasswordResetToken: jest.fn(),
            sendEmailPasswordResetLink: jest.fn(),
          },
        },
      ],
    }).compile();

    job = module.get<EmailPasswordResetLinkJob>(EmailPasswordResetLinkJob);
    resetPasswordService =
      module.get<ResetPasswordService>(ResetPasswordService);
  });

  it('should send the email when a token is generated', async () => {
    const mockUser = { id: '1', email: 'test@example.com' };
    const mockWorkspace = { id: 'workspace-id' };
    const mockResetToken = {
      workspaceId: 'workspace-id',
      passwordResetToken: 'token123',
      passwordResetTokenExpiresAt: new Date(),
    };

    (
      resetPasswordService.generatePasswordResetToken as jest.Mock
    ).mockResolvedValue({
      status: 'TOKEN_GENERATED',
      resetToken: mockResetToken,
      user: mockUser,
      workspace: mockWorkspace,
    });

    await job.handle({
      email: 'test@example.com',
      workspaceId: 'workspace-id',
      locale: 'en',
    });

    expect(
      resetPasswordService.generatePasswordResetToken,
    ).toHaveBeenCalledWith('test@example.com', 'workspace-id');
    expect(
      resetPasswordService.invalidatePasswordResetToken,
    ).toHaveBeenCalledWith('1');
    expect(resetPasswordService.savePasswordResetToken).toHaveBeenCalledWith({
      userId: '1',
      resetToken: mockResetToken,
    });
    expect(
      resetPasswordService.sendEmailPasswordResetLink,
    ).toHaveBeenCalledWith({
      resetToken: mockResetToken,
      user: mockUser,
      workspace: mockWorkspace,
      locale: 'en',
    });
  });

  it('should persist the token before sending and rethrow sending errors', async () => {
    (
      resetPasswordService.generatePasswordResetToken as jest.Mock
    ).mockResolvedValue({
      status: 'TOKEN_GENERATED',
      resetToken: {
        workspaceId: 'workspace-id',
        passwordResetToken: 'token123',
        passwordResetTokenExpiresAt: new Date(),
      },
      user: { id: '1', email: 'test@example.com' },
      workspace: { id: 'workspace-id' },
    });
    (
      resetPasswordService.sendEmailPasswordResetLink as jest.Mock
    ).mockRejectedValue(new Error('email provider down'));

    await expect(
      job.handle({
        email: 'test@example.com',
        workspaceId: 'workspace-id',
        locale: 'en',
      }),
    ).rejects.toThrow('email provider down');

    expect(resetPasswordService.savePasswordResetToken).toHaveBeenCalled();
  });

  it('should rethrow persistence errors without sending an email', async () => {
    (
      resetPasswordService.generatePasswordResetToken as jest.Mock
    ).mockResolvedValue({
      status: 'TOKEN_GENERATED',
      resetToken: {
        workspaceId: 'workspace-id',
        passwordResetToken: 'token123',
        passwordResetTokenExpiresAt: new Date(),
      },
      user: { id: '1', email: 'test@example.com' },
      workspace: { id: 'workspace-id' },
    });
    (
      resetPasswordService.savePasswordResetToken as jest.Mock
    ).mockRejectedValue(new Error('db down'));

    await expect(
      job.handle({
        email: 'test@example.com',
        workspaceId: 'workspace-id',
        locale: 'en',
      }),
    ).rejects.toThrow('db down');

    expect(
      resetPasswordService.sendEmailPasswordResetLink,
    ).not.toHaveBeenCalled();
  });

  it.each(['USER_NOT_FOUND', 'NO_PASSWORD_AUTH_ENABLED_WORKSPACE_FOUND'])(
    'should skip sending the email when generation status is %s',
    async (status) => {
      (
        resetPasswordService.generatePasswordResetToken as jest.Mock
      ).mockResolvedValue({ status });

      await job.handle({ email: 'test@example.com', locale: 'en' });

      expect(
        resetPasswordService.sendEmailPasswordResetLink,
      ).not.toHaveBeenCalled();
    },
  );
});
