import { AuthException } from 'src/engine/core-modules/auth/auth.exception';
import { SsoUserProvisioningService } from 'src/engine/core-modules/auth/services/sso-user-provisioning.service';

type ConfigKey = 'SMB_NAME';

const buildService = (overrides?: {
  existingUser?: unknown;
  workspace?: unknown;
  configuredSubdomain?: string;
}) => {
  const userRepository = {
    findOne: jest.fn().mockResolvedValue(overrides?.existingUser ?? null),
    create: jest.fn((u) => u),
    save: jest.fn(async (u) => ({ id: 'user-id-1', ...u })),
  };
  const workspaceRepository = {
    findOne: jest.fn().mockResolvedValue(
      overrides?.workspace ?? {
        id: 'workspace-id-1',
        subdomain: 'askii',
      },
    ),
  };
  const userWorkspaceService = {
    addUserToWorkspaceIfUserNotInWorkspace: jest.fn(),
  };
  const twentyConfigService = {
    get: jest.fn((key: ConfigKey) =>
      key === 'SMB_NAME'
        ? (overrides?.configuredSubdomain ?? 'askii')
        : undefined,
    ),
  };

  const service = new SsoUserProvisioningService(
    userRepository as any,
    workspaceRepository as any,
    userWorkspaceService as any,
    twentyConfigService as any,
  );

  return {
    service,
    userRepository,
    workspaceRepository,
    userWorkspaceService,
    twentyConfigService,
  };
};

describe('SsoUserProvisioningService', () => {
  it('should reject email without @-sign', async () => {
    const { service } = buildService();

    await expect(service.findOrProvision('plainusername')).rejects.toThrow(
      AuthException,
    );
  });

  it('should reject empty email', async () => {
    const { service } = buildService();

    await expect(service.findOrProvision('   ')).rejects.toThrow(AuthException);
  });

  it('should throw when SMB_NAME is not configured', async () => {
    const { service } = buildService({ configuredSubdomain: '' });

    await expect(service.findOrProvision('user@askii.ai')).rejects.toThrow(
      'SMB_NAME not configured',
    );
  });

  it('should throw when configured workspace is missing', async () => {
    const { service, workspaceRepository } = buildService();

    workspaceRepository.findOne.mockResolvedValueOnce(null);

    await expect(service.findOrProvision('user@askii.ai')).rejects.toThrow(
      'SSO workspace not provisioned',
    );
  });

  it('should create new user and add to workspace when user does not exist', async () => {
    const { service, userRepository, userWorkspaceService } = buildService();

    const result = await service.findOrProvision('NEW@Askii.ai');

    expect(userRepository.findOne).toHaveBeenCalledWith({
      where: { email: 'new@askii.ai' },
    });
    expect(userRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'new@askii.ai',
        firstName: '',
        lastName: '',
        passwordHash: expect.any(String),
        isEmailVerified: true,
      }),
    );
    expect(userRepository.save).toHaveBeenCalled();
    expect(
      userWorkspaceService.addUserToWorkspaceIfUserNotInWorkspace,
    ).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'new@askii.ai' }),
      expect.objectContaining({ subdomain: 'askii' }),
    );
    expect(result.user.email).toBe('new@askii.ai');
    expect(result.workspace.subdomain).toBe('askii');
  });

  it('should reuse existing user and still ensure workspace membership (idempotent)', async () => {
    const existingUser = {
      id: 'existing-user-id',
      email: 'returning@askii.ai',
    };
    const { service, userRepository, userWorkspaceService } = buildService({
      existingUser,
    });

    const result = await service.findOrProvision('returning@askii.ai');

    expect(userRepository.create).not.toHaveBeenCalled();
    expect(userRepository.save).not.toHaveBeenCalled();
    expect(
      userWorkspaceService.addUserToWorkspaceIfUserNotInWorkspace,
    ).toHaveBeenCalledWith(existingUser, expect.anything());
    expect(result.user).toBe(existingUser);
  });

  it('should normalize email to lowercase before lookup', async () => {
    const { service, userRepository } = buildService();

    await service.findOrProvision('  Mixed@CASE.com  ');

    expect(userRepository.findOne).toHaveBeenCalledWith({
      where: { email: 'mixed@case.com' },
    });
  });
});
