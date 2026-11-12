import { Test, type TestingModule } from '@nestjs/testing';

import { renderEmail } from 'twenty-emails';

import { EmailService } from 'src/engine/core-modules/email/email.service';
import { I18nService } from 'src/engine/core-modules/i18n/i18n.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { TwoFactorAuthenticationBackupCodeService } from 'src/engine/core-modules/two-factor-authentication/services/two-factor-authentication-backup-code.service';
import { TwoFactorAuthenticationEmailService } from 'src/engine/core-modules/two-factor-authentication/services/two-factor-authentication-email.service';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';

jest.mock('twenty-emails', () => ({
  ...jest.requireActual('twenty-emails'),
  renderEmail: jest.fn().mockResolvedValue('email'),
}));

const RECIPIENT = { userId: 'user-id', workspaceId: 'workspace-id' };

const getRenderedEmailContent = () =>
  JSON.stringify((renderEmail as jest.Mock).mock.calls[0][0].props);

describe('TwoFactorAuthenticationEmailService', () => {
  let service: TwoFactorAuthenticationEmailService;
  let emailService: { send: jest.Mock };
  let userWorkspaceService: { getUserWorkspaceForUser: jest.Mock };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TwoFactorAuthenticationEmailService,
        { provide: EmailService, useValue: { send: jest.fn() } },
        {
          provide: I18nService,
          useValue: {
            getI18nInstance: () => ({
              _: (message: { message?: string }) => message.message ?? '',
            }),
          },
        },
        {
          provide: TwentyConfigService,
          useValue: { get: () => 'noreply@example.com' },
        },
        {
          provide: UserWorkspaceService,
          useValue: {
            getUserWorkspaceForUser: jest.fn().mockResolvedValue({
              locale: 'en',
              user: { email: 'member@example.com' },
              workspace: { displayName: 'Apple' },
            }),
          },
        },
        {
          provide: TwoFactorAuthenticationBackupCodeService,
          useValue: { getRemainingBackupCodeCount: jest.fn() },
        },
      ],
    }).compile();

    service = module.get(TwoFactorAuthenticationEmailService);
    emailService = module.get(EmailService);
    userWorkspaceService = module.get(UserWorkspaceService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('tells the member their authenticator was removed', async () => {
    await service.sendTwoFactorAuthenticationRemovedEmail(RECIPIENT);

    expect(getRenderedEmailContent()).toContain(
      'The authenticator for your account in {workspaceDisplayName} was removed from Settings.',
    );
    expect(getRenderedEmailContent()).toContain('Apple');
    expect(emailService.send).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'member@example.com',
        subject: 'Two-factor authentication was removed from your account',
      }),
    );
  });

  it('tells the member new backup codes were generated', async () => {
    await service.sendBackupCodesRegeneratedEmail(RECIPIENT);

    expect(getRenderedEmailContent()).toContain(
      'New backup codes were generated for your account in {workspaceDisplayName}.',
    );
    expect(getRenderedEmailContent()).toContain('Apple');
    expect(emailService.send).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'member@example.com',
        subject: 'New backup codes were generated for your account',
      }),
    );
  });

  it('skips the email without failing when the member cannot be found', async () => {
    userWorkspaceService.getUserWorkspaceForUser.mockResolvedValue(null);

    await expect(
      service.sendBackupCodesRegeneratedEmail(RECIPIENT),
    ).resolves.toBeUndefined();
    expect(emailService.send).not.toHaveBeenCalled();
  });

  it('does not fail when the email cannot be sent', async () => {
    emailService.send.mockRejectedValue(new Error('SMTP down'));

    await expect(
      service.sendTwoFactorAuthenticationRemovedEmail(RECIPIENT),
    ).resolves.toBeUndefined();
  });
});
