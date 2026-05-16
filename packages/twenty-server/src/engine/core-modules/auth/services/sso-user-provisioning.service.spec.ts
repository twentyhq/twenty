import { AuthException } from 'src/engine/core-modules/auth/auth.exception';
import { SsoUserProvisioningService } from 'src/engine/core-modules/auth/services/sso-user-provisioning.service';

type ConfigKey = 'SMB_NAME';

const buildService = (overrides?: {
  existingUser?: unknown;
  workspace?: unknown;
  configuredSubdomain?: string;
  insideLockExistingUser?: unknown;
}) => {
  // Find-or-create runs inside dataSource.transaction. The repository
  // returned by manager.getRepository(UserEntity) is the same jest
  // mock as the injected one so existing assertions on
  // `userRepository.findOne/create/save` keep working unchanged.
  const userRepository = {
    findOne: jest.fn().mockResolvedValue(overrides?.existingUser ?? null),
    create: jest.fn((u) => u),
    save: jest.fn(async (u) => ({ id: 'user-id-1', ...u })),
  };

  const queryFn = jest.fn().mockResolvedValue(undefined);
  const dataSource = {
    transaction: jest.fn(async (cb: (m: any) => Promise<unknown>) =>
      cb({
        query: queryFn,
        getRepository: jest.fn(() => userRepository),
      }),
    ),
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
    dataSource as any,
  );

  return {
    service,
    userRepository,
    workspaceRepository,
    userWorkspaceService,
    twentyConfigService,
    dataSource,
    queryFn,
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

  it('should acquire an advisory lock keyed by email before find+create', async () => {
    // Concurrent-creation race guard: every first-login provisioning
    // attempt must take a Postgres advisory lock keyed on the email
    // hash so parallel requests for the same email serialise on the
    // create. Other emails take different lock keys so distinct
    // first-logins don't contend.
    const { service, queryFn, dataSource } = buildService();

    await service.findOrProvision('alice@askii.ai');

    expect(dataSource.transaction).toHaveBeenCalledTimes(1);
    expect(queryFn).toHaveBeenCalledWith(
      expect.stringMatching(/pg_advisory_xact_lock\s*\(\s*hashtextextended/),
      ['alice@askii.ai'],
    );
  });

  it('should take the advisory lock before any user lookup', async () => {
    // The race protection only works if the lock is taken BEFORE the
    // findOne. If a refactor accidentally moves the findOne above the
    // lock, two concurrent requests could both pass the miss check
    // before either takes the lock — race reopens.
    const callOrder: string[] = [];
    const { service, userRepository, queryFn } = buildService();

    queryFn.mockImplementation(async () => {
      callOrder.push('lock');
    });
    userRepository.findOne.mockImplementation(async () => {
      callOrder.push('findOne');
      return null;
    });

    await service.findOrProvision('alice@askii.ai');

    expect(callOrder[0]).toBe('lock');
    expect(callOrder.indexOf('findOne')).toBeGreaterThan(
      callOrder.indexOf('lock'),
    );
  });

  it('should skip create when another request committed a row first', async () => {
    // Race: this request waited on the advisory lock; while it waited,
    // another concurrent request committed a User row for the same
    // email. The lock serialises; once we acquire it, our findOne
    // sees that row and we skip our own create. Without serialisation
    // both racing requests would insert duplicate rows.
    const winningUser = {
      id: 'committed-by-other-request',
      email: 'racy@askii.ai',
    };
    const { service, userRepository, userWorkspaceService } = buildService({
      existingUser: winningUser,
    });

    const result = await service.findOrProvision('racy@askii.ai');

    expect(userRepository.create).not.toHaveBeenCalled();
    expect(userRepository.save).not.toHaveBeenCalled();
    expect(result.user).toBe(winningUser);
    // Membership ensure runs regardless of who won the race — the
    // workspace join is idempotent on its own.
    expect(
      userWorkspaceService.addUserToWorkspaceIfUserNotInWorkspace,
    ).toHaveBeenCalledWith(winningUser, expect.anything());
  });
});
