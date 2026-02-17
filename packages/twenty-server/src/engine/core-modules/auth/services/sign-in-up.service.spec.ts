import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { type SignInUpNewUserPayload } from 'src/engine/core-modules/auth/types/signInUp.type';
import { AuthProviderEnum } from 'src/engine/core-modules/workspace/types/workspace.type';

import { SignInUpService } from './sign-in-up.service';

const mockPartialUserPayload: SignInUpNewUserPayload = {
  email: 'first.user@acme.dev',
  firstName: 'First',
  lastName: 'User',
  locale: 'en',
  isEmailAlreadyVerified: true,
};

type MockConfigurationValues = {
  IS_MULTIWORKSPACE_ENABLED: boolean;
  IS_WORKSPACE_CREATION_LIMITED_TO_SERVER_ADMINS: boolean;
  SERVER_URL: string;
};

const createSignInUpServiceForTests = () => {
  const mockUserRepository = {
    create: jest.fn((user) => user),
    save: jest.fn(async (user) => ({ id: 'saved-user-id', ...user })),
    count: jest.fn(),
  };

  const mockWorkspaceRepository = {
    count: jest.fn(),
    create: jest.fn(),
  };

  const mockConfigurationValues: MockConfigurationValues = {
    IS_MULTIWORKSPACE_ENABLED: true,
    IS_WORKSPACE_CREATION_LIMITED_TO_SERVER_ADMINS: false,
    SERVER_URL: 'http://localhost:3000',
  };

  const mockTwentyConfigService = {
    get: jest.fn(
      (configKey: keyof MockConfigurationValues) =>
        mockConfigurationValues[configKey],
    ),
  };

  const queryRunnerMock = {
    manager: {
      save: jest.fn(),
    },
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
  };

  const service = new SignInUpService(
    mockUserRepository as any,
    mockWorkspaceRepository as any,
    {
      validatePersonalInvitation: jest.fn(),
      invalidateWorkspaceInvitation: jest.fn(),
    } as any,
    {
      create: jest.fn(),
      checkUserWorkspaceExists: jest.fn(),
    } as any,
    {
      setOnboardingCreateProfilePending: jest.fn(),
      setOnboardingInviteTeamPending: jest.fn(),
      createOnboardingStatusForWorkspaceMember: jest.fn(),
    } as any,
    {
      emitCustomBatchEvent: jest.fn(),
    } as any,
    {
      getHttpClient: jest.fn(),
    } as any,
    mockTwentyConfigService as any,
    {
      generateSubdomain: jest.fn(),
    } as any,
    {
      findUserByEmail: jest.fn(),
      findByEmail: jest.fn(),
      markEmailAsVerified: jest.fn(),
    } as any,
    {
      incrementCounter: jest.fn(),
    } as any,
    {
      invalidateAndRecompute: jest.fn(),
    } as any,
    {
      createWorkspaceCustomApplication: jest.fn(),
    } as any,
    {
      createQueryRunner: jest.fn(() => queryRunnerMock),
    } as any,
  );

  return {
    service,
    mockUserRepository,
    mockWorkspaceRepository,
    mockConfigurationValues,
  };
};

describe('SignInUpService workspace-creation policy', () => {
  it('grants bootstrap owner server permissions when multi-workspace is enabled and unrestricted', async () => {
    const {
      service,
      mockUserRepository,
      mockWorkspaceRepository,
      mockConfigurationValues,
    } = createSignInUpServiceForTests();

    mockConfigurationValues.IS_MULTIWORKSPACE_ENABLED = true;
    mockConfigurationValues.IS_WORKSPACE_CREATION_LIMITED_TO_SERVER_ADMINS =
      false;
    mockWorkspaceRepository.count.mockResolvedValue(0);
    mockUserRepository.count.mockResolvedValue(0);
    jest
      .spyOn((service as any).userService, 'findUserByEmail')
      .mockResolvedValue(null);

    await service.signUpWithoutWorkspace(mockPartialUserPayload, {
      provider: AuthProviderEnum.Google,
    } as any);

    expect(mockUserRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        canImpersonate: true,
        canAccessFullAdminPanel: true,
      }),
    );
  });

  it('grants bootstrap owner server permissions when multi-workspace is enabled and restricted', async () => {
    const {
      service,
      mockUserRepository,
      mockWorkspaceRepository,
      mockConfigurationValues,
    } = createSignInUpServiceForTests();

    mockConfigurationValues.IS_MULTIWORKSPACE_ENABLED = true;
    mockConfigurationValues.IS_WORKSPACE_CREATION_LIMITED_TO_SERVER_ADMINS =
      true;
    mockWorkspaceRepository.count.mockResolvedValue(0);
    mockUserRepository.count.mockResolvedValue(0);
    jest
      .spyOn((service as any).userService, 'findUserByEmail')
      .mockResolvedValue(null);

    await service.signUpWithoutWorkspace(mockPartialUserPayload, {
      provider: AuthProviderEnum.Google,
    } as any);

    expect(mockUserRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        canImpersonate: true,
        canAccessFullAdminPanel: true,
      }),
    );
  });

  it('assigns default non-admin permissions after bootstrap in multi-workspace mode', async () => {
    const {
      service,
      mockUserRepository,
      mockWorkspaceRepository,
      mockConfigurationValues,
    } = createSignInUpServiceForTests();

    mockConfigurationValues.IS_MULTIWORKSPACE_ENABLED = true;
    mockConfigurationValues.IS_WORKSPACE_CREATION_LIMITED_TO_SERVER_ADMINS =
      false;
    mockWorkspaceRepository.count.mockResolvedValue(1);
    mockUserRepository.count.mockResolvedValue(1);
    jest
      .spyOn((service as any).userService, 'findUserByEmail')
      .mockResolvedValue(null);

    await service.signUpWithoutWorkspace(mockPartialUserPayload, {
      provider: AuthProviderEnum.Google,
    } as any);

    expect(mockUserRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        canImpersonate: false,
        canAccessFullAdminPanel: false,
      }),
    );
  });

  it('does not grant admin to second user signing up before any workspace exists', async () => {
    const {
      service,
      mockUserRepository,
      mockWorkspaceRepository,
      mockConfigurationValues,
    } = createSignInUpServiceForTests();

    mockConfigurationValues.IS_MULTIWORKSPACE_ENABLED = true;
    mockConfigurationValues.IS_WORKSPACE_CREATION_LIMITED_TO_SERVER_ADMINS =
      false;
    mockWorkspaceRepository.count.mockResolvedValue(0);
    mockUserRepository.count.mockResolvedValue(1);
    jest
      .spyOn((service as any).userService, 'findUserByEmail')
      .mockResolvedValue(null);

    await service.signUpWithoutWorkspace(mockPartialUserPayload, {
      provider: AuthProviderEnum.Google,
    } as any);

    expect(mockUserRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        canImpersonate: false,
        canAccessFullAdminPanel: false,
      }),
    );
  });

  it('throws forbidden when a non-admin existing user creates workspace in restricted mode after bootstrap', async () => {
    const { service, mockWorkspaceRepository, mockConfigurationValues } =
      createSignInUpServiceForTests();

    mockConfigurationValues.IS_MULTIWORKSPACE_ENABLED = true;
    mockConfigurationValues.IS_WORKSPACE_CREATION_LIMITED_TO_SERVER_ADMINS =
      true;
    mockWorkspaceRepository.count.mockResolvedValue(1);

    const nonAdminExistingUser = {
      id: 'existing-user-id',
      email: 'existing.user@acme.dev',
      canAccessFullAdminPanel: false,
    };

    await expect(
      service.signUpOnNewWorkspace({
        type: 'existingUser',
        existingUser: nonAdminExistingUser as any,
      }),
    ).rejects.toMatchObject({
      code: AuthExceptionCode.FORBIDDEN_EXCEPTION,
    });
  });

  it('throws SIGNUP_DISABLED when creating workspace in single-workspace mode after bootstrap', async () => {
    const { service, mockWorkspaceRepository, mockConfigurationValues } =
      createSignInUpServiceForTests();

    mockConfigurationValues.IS_MULTIWORKSPACE_ENABLED = false;
    mockConfigurationValues.IS_WORKSPACE_CREATION_LIMITED_TO_SERVER_ADMINS =
      false;
    mockWorkspaceRepository.count.mockResolvedValue(1);

    await expect(
      service.signUpOnNewWorkspace({
        type: 'existingUser',
        existingUser: {
          id: 'existing-user-id',
          email: 'existing.user@acme.dev',
          canAccessFullAdminPanel: true,
        } as any,
      }),
    ).rejects.toMatchObject({
      code: AuthExceptionCode.SIGNUP_DISABLED,
    });
  });

  it('keeps single-workspace SIGNUP_DISABLED behavior after first workspace exists', async () => {
    const { service, mockWorkspaceRepository, mockConfigurationValues } =
      createSignInUpServiceForTests();

    mockConfigurationValues.IS_MULTIWORKSPACE_ENABLED = false;
    mockConfigurationValues.IS_WORKSPACE_CREATION_LIMITED_TO_SERVER_ADMINS =
      false;
    mockWorkspaceRepository.count.mockResolvedValue(1);
    jest
      .spyOn((service as any).userService, 'findUserByEmail')
      .mockResolvedValue(null);

    await expect(
      service.signUpWithoutWorkspace(mockPartialUserPayload, {
        provider: AuthProviderEnum.Google,
      } as any),
    ).rejects.toBeInstanceOf(AuthException);

    await expect(
      service.signUpWithoutWorkspace(mockPartialUserPayload, {
        provider: AuthProviderEnum.Google,
      } as any),
    ).rejects.toMatchObject({
      code: AuthExceptionCode.SIGNUP_DISABLED,
    });
  });
});
