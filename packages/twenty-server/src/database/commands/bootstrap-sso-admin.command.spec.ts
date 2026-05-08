import { Logger } from '@nestjs/common';

import { BootstrapSsoAdminCommand } from 'src/database/commands/bootstrap-sso-admin.command';

type ConfigKey = 'SMB_NAME';

const buildCommand = (overrides?: {
  existingUser?: unknown;
  workspace?: unknown;
  adminRole?: unknown;
  configuredSubdomain?: string;
  helperResult?: { wasExistingMember: boolean };
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
  const roleRepository = {
    findOne: jest
      .fn()
      .mockResolvedValue(
        overrides?.adminRole ?? { id: 'admin-role-id', label: 'Admin' },
      ),
  };
  const userWorkspaceService = {
    addUserToWorkspaceOrEnsureRole: jest
      .fn()
      .mockResolvedValue(
        overrides?.helperResult ?? { wasExistingMember: false },
      ),
  };
  const twentyConfigService = {
    get: jest.fn((key: ConfigKey) =>
      key === 'SMB_NAME'
        ? (overrides?.configuredSubdomain ?? 'askii')
        : undefined,
    ),
  };

  const command = new BootstrapSsoAdminCommand(
    userRepository as any,
    workspaceRepository as any,
    roleRepository as any,
    userWorkspaceService as any,
    twentyConfigService as any,
  );

  return {
    command,
    userRepository,
    workspaceRepository,
    roleRepository,
    userWorkspaceService,
    twentyConfigService,
  };
};

describe('BootstrapSsoAdminCommand', () => {
  let logSpy: jest.SpyInstance;

  beforeEach(() => {
    logSpy = jest
      .spyOn(Logger.prototype, 'log')
      .mockImplementation(() => undefined);
  });

  afterEach(() => {
    logSpy.mockRestore();
  });

  it('throws when SMB_NAME is not configured', async () => {
    const { command } = buildCommand({ configuredSubdomain: '' });

    await expect(command.run([], { email: 'admin@askii.ai' })).rejects.toThrow(
      'SMB_NAME is not configured',
    );
  });

  it('throws on email without @-sign', async () => {
    const { command } = buildCommand();

    await expect(command.run([], { email: 'plainusername' })).rejects.toThrow(
      'Invalid email',
    );
  });

  it('throws when workspace with subdomain not found', async () => {
    const { command, workspaceRepository } = buildCommand();

    workspaceRepository.findOne.mockResolvedValueOnce(null);

    await expect(command.run([], { email: 'admin@askii.ai' })).rejects.toThrow(
      'Workspace with subdomain="askii" not found',
    );
  });

  it('throws when Admin role is missing in the workspace', async () => {
    const { command, roleRepository } = buildCommand();

    roleRepository.findOne.mockResolvedValueOnce(null);

    await expect(command.run([], { email: 'admin@askii.ai' })).rejects.toThrow(
      'Admin role missing in workspace',
    );
  });

  it('newly provisions Admin user when no userWorkspace exists (cold start)', async () => {
    const { command, userRepository, userWorkspaceService } = buildCommand({
      helperResult: { wasExistingMember: false },
    });

    await command.run([], { email: 'ADMIN@Askii.ai' });

    expect(userRepository.findOne).toHaveBeenCalledWith({
      where: { email: 'admin@askii.ai' },
    });
    expect(userRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'admin@askii.ai',
        isEmailVerified: true,
      }),
    );
    expect(userRepository.save).toHaveBeenCalled();
    expect(
      userWorkspaceService.addUserToWorkspaceOrEnsureRole,
    ).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'admin@askii.ai' }),
      expect.objectContaining({ subdomain: 'askii' }),
      'admin-role-id',
    );
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining('newly provisioned'),
    );
  });

  it('promotes existing Member to Admin (regression case for bug_001)', async () => {
    const existingUser = {
      id: 'existing-user-id',
      email: 'admin@askii.ai',
    };
    const { command, userRepository, userWorkspaceService } = buildCommand({
      existingUser,
      helperResult: { wasExistingMember: true },
    });

    await command.run([], { email: 'admin@askii.ai' });

    expect(userRepository.create).not.toHaveBeenCalled();
    expect(userRepository.save).not.toHaveBeenCalled();
    expect(
      userWorkspaceService.addUserToWorkspaceOrEnsureRole,
    ).toHaveBeenCalledWith(
      existingUser,
      expect.objectContaining({ subdomain: 'askii' }),
      'admin-role-id',
    );
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining('promoted to Admin'),
    );
  });
});
