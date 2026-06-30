import { type Repository } from 'typeorm';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { AuthService } from 'src/engine/core-modules/auth/services/auth.service';
import { SaasAuthWorkspaceService } from 'src/engine/core-modules/auth/services/saas-auth-workspace.service';
import { SignInUpService } from 'src/engine/core-modules/auth/services/sign-in-up.service';
import { OnboardingService } from 'src/engine/core-modules/onboarding/onboarding.service';
import { UserService } from 'src/engine/core-modules/user/services/user.service';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { AuthProviderEnum } from 'src/engine/core-modules/workspace/types/workspace.type';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { RoleService } from 'src/engine/metadata-modules/role/role.service';
import { STANDARD_ROLE } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-role.constant';

describe('SaasAuthWorkspaceService', () => {
  let service: SaasAuthWorkspaceService;
  let authService: jest.Mocked<
    Pick<AuthService, 'formatUserDataPayload' | 'signInUp'>
  >;
  let signInUpService: jest.Mocked<
    Pick<
      SignInUpService,
      'computePartialUserFromUserPayload' | 'signUpOnNewWorkspace'
    >
  >;
  let onboardingService: jest.Mocked<
    Pick<
      OnboardingService,
      | 'completeOnboardingProfileStepIfNameProvided'
      | 'setOnboardingInviteTeamPending'
    >
  >;
  let roleService: jest.Mocked<
    Pick<RoleService, 'getRoleByUniversalIdentifier'>
  >;
  let userService: jest.Mocked<Pick<UserService, 'findUserByEmail'>>;
  let workspaceRepository: jest.Mocked<
    Pick<Repository<WorkspaceEntity>, 'findOne'>
  >;

  const existingUser = {
    id: 'user-id',
    email: 'user@example.com',
  } as UserEntity;

  const existingWorkspace = {
    id: 'workspace-id',
    saasAuthBusinessId: 'business-1',
  } as WorkspaceEntity;

  beforeEach(() => {
    authService = {
      formatUserDataPayload: jest.fn(),
      signInUp: jest.fn(),
    };
    signInUpService = {
      computePartialUserFromUserPayload: jest.fn(),
      signUpOnNewWorkspace: jest.fn(),
    };
    onboardingService = {
      completeOnboardingProfileStepIfNameProvided: jest.fn(),
      setOnboardingInviteTeamPending: jest.fn(),
    };
    roleService = {
      getRoleByUniversalIdentifier: jest.fn(),
    };
    userService = {
      findUserByEmail: jest.fn(),
    };
    workspaceRepository = {
      findOne: jest.fn(),
    };

    service = new SaasAuthWorkspaceService(
      authService as unknown as AuthService,
      signInUpService as unknown as SignInUpService,
      onboardingService as unknown as OnboardingService,
      roleService as unknown as RoleService,
      userService as unknown as UserService,
      workspaceRepository as unknown as Repository<WorkspaceEntity>,
    );
  });

  it('should reuse an existing workspace for a SaaS business id', async () => {
    userService.findUserByEmail.mockResolvedValue(existingUser);
    authService.formatUserDataPayload.mockReturnValue({
      userData: { type: 'existingUser', existingUser },
    });
    workspaceRepository.findOne.mockResolvedValue(existingWorkspace);
    authService.signInUp.mockResolvedValue({
      user: existingUser,
      workspace: existingWorkspace,
    });

    const result = await service.provisionWorkspaces({
      email: existingUser.email,
      businesses: [{ id: 'business-1', name: 'Business One' }],
    });

    expect(result.businesses).toEqual([
      {
        id: 'business-1',
        name: 'Business One',
        workspaceId: existingWorkspace.id,
      },
    ]);
    expect(workspaceRepository.findOne).toHaveBeenCalledWith({
      where: { saasAuthBusinessId: 'business-1' },
    });
    expect(authService.signInUp).toHaveBeenCalledWith({
      userData: { type: 'existingUser', existingUser },
      workspace: existingWorkspace,
      roleId: undefined,
      authParams: { provider: AuthProviderEnum.SSO },
    });
    expect(signInUpService.signUpOnNewWorkspace).not.toHaveBeenCalled();
    expect(
      onboardingService.completeOnboardingProfileStepIfNameProvided,
    ).toHaveBeenCalledWith({
      userId: existingUser.id,
      workspaceId: existingWorkspace.id,
      firstName: undefined,
      lastName: undefined,
    });
    expect(
      onboardingService.setOnboardingInviteTeamPending,
    ).toHaveBeenCalledWith({
      workspaceId: existingWorkspace.id,
      value: false,
    });
  });

  it('should assign admin role when a new SaaS user joins an existing workspace', async () => {
    const createdUser = {
      id: 'created-user-id',
      email: 'new-user@example.com',
    } as UserEntity;
    const newUserPayload = {
      email: createdUser.email,
      isEmailAlreadyVerified: true,
    };

    userService.findUserByEmail.mockResolvedValue(null);
    authService.formatUserDataPayload.mockReturnValue({
      userData: { type: 'newUser', newUserPayload },
    });
    workspaceRepository.findOne.mockResolvedValue(existingWorkspace);
    roleService.getRoleByUniversalIdentifier.mockResolvedValue({
      id: 'admin-role-id',
    } as Awaited<ReturnType<RoleService['getRoleByUniversalIdentifier']>>);
    authService.signInUp.mockResolvedValue({
      user: createdUser,
      workspace: existingWorkspace,
    });

    await service.provisionWorkspaces({
      email: createdUser.email,
      businesses: [{ id: 'business-1', name: 'Business One' }],
    });

    expect(roleService.getRoleByUniversalIdentifier).toHaveBeenCalledWith({
      workspaceId: existingWorkspace.id,
      universalIdentifier: STANDARD_ROLE.admin.universalIdentifier,
    });
    expect(authService.signInUp).toHaveBeenCalledWith({
      userData: { type: 'newUser', newUserPayload },
      workspace: existingWorkspace,
      roleId: 'admin-role-id',
      authParams: { provider: AuthProviderEnum.SSO },
    });
  });

  it('should create a workspace for a new SaaS business id', async () => {
    const createdUser = {
      id: 'created-user-id',
      email: 'new-user@example.com',
    } as UserEntity;
    const createdWorkspace = {
      id: 'created-workspace-id',
      saasAuthBusinessId: 'business-2',
    } as WorkspaceEntity;
    const newUserPayload = {
      email: createdUser.email,
      firstName: 'New',
      lastName: 'User',
      isEmailAlreadyVerified: true,
    };
    const newUserWithPicture = {
      ...newUserPayload,
      isEmailVerified: true,
    };

    userService.findUserByEmail.mockResolvedValue(null);
    authService.formatUserDataPayload.mockReturnValue({
      userData: { type: 'newUser', newUserPayload },
    });
    workspaceRepository.findOne.mockResolvedValue(null);
    signInUpService.computePartialUserFromUserPayload.mockResolvedValue(
      newUserWithPicture,
    );
    signInUpService.signUpOnNewWorkspace.mockResolvedValue({
      user: createdUser,
      workspace: createdWorkspace,
    });

    const result = await service.provisionWorkspaces({
      user: {
        email: createdUser.email,
        firstName: 'New',
        lastName: 'User',
      },
      businesses: [{ businessId: 'business-2', displayName: 'Business Two' }],
    });

    expect(result.businesses).toEqual([
      {
        id: 'business-2',
        name: 'Business Two',
        workspaceId: createdWorkspace.id,
      },
    ]);
    expect(signInUpService.signUpOnNewWorkspace).toHaveBeenCalledWith(
      {
        type: 'newUserWithPicture',
        newUserWithPicture,
      },
      {
        displayName: 'Business Two',
        saasAuthBusinessId: 'business-2',
      },
    );
    expect(
      onboardingService.completeOnboardingProfileStepIfNameProvided,
    ).toHaveBeenCalledWith({
      userId: createdUser.id,
      workspaceId: createdWorkspace.id,
      firstName: 'New',
      lastName: 'User',
    });
    expect(
      onboardingService.setOnboardingInviteTeamPending,
    ).toHaveBeenCalledWith({
      workspaceId: createdWorkspace.id,
      value: false,
    });
  });

  it('should reuse the created user across multiple SaaS businesses', async () => {
    const createdUser = {
      id: 'created-user-id',
      email: 'new-user@example.com',
    } as UserEntity;
    const firstWorkspace = {
      id: 'first-workspace-id',
      saasAuthBusinessId: 'business-1',
    } as WorkspaceEntity;
    const secondWorkspace = {
      id: 'second-workspace-id',
      saasAuthBusinessId: 'business-2',
    } as WorkspaceEntity;
    const newUserPayload = {
      email: createdUser.email,
      isEmailAlreadyVerified: true,
    };
    const newUserWithPicture = {
      email: createdUser.email,
      isEmailVerified: true,
    };

    userService.findUserByEmail.mockResolvedValue(null);
    authService.formatUserDataPayload.mockReturnValue({
      userData: { type: 'newUser', newUserPayload },
    });
    workspaceRepository.findOne
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(secondWorkspace);
    signInUpService.computePartialUserFromUserPayload.mockResolvedValue(
      newUserWithPicture,
    );
    signInUpService.signUpOnNewWorkspace.mockResolvedValue({
      user: createdUser,
      workspace: firstWorkspace,
    });
    authService.signInUp.mockResolvedValue({
      user: createdUser,
      workspace: secondWorkspace,
    });

    const result = await service.provisionWorkspaces({
      email: createdUser.email,
      businesses: [{ id: 'business-1' }, { id: 'business-2' }],
    });

    expect(result.businesses).toEqual([
      {
        id: 'business-1',
        name: 'Business business-1',
        workspaceId: firstWorkspace.id,
      },
      {
        id: 'business-2',
        name: 'Business business-2',
        workspaceId: secondWorkspace.id,
      },
    ]);
    expect(authService.signInUp).toHaveBeenCalledWith({
      userData: { type: 'existingUser', existingUser: createdUser },
      workspace: secondWorkspace,
      roleId: undefined,
      authParams: { provider: AuthProviderEnum.SSO },
    });
  });

  it('should reject SaaS payloads without an email', async () => {
    await expect(
      service.provisionWorkspaces({
        businesses: [{ id: 'business-1' }],
      }),
    ).rejects.toMatchObject({
      code: AuthExceptionCode.OAUTH_ACCESS_DENIED,
    } satisfies Partial<AuthException>);
  });
});
