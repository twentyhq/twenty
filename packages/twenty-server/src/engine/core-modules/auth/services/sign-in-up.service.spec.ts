import { HttpService } from '@nestjs/axios';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { Repository } from 'typeorm';

import { AppToken } from 'src/engine/core-modules/app-token/app-token.entity';
import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { SignInUpService } from 'src/engine/core-modules/auth/services/sign-in-up.service';
import {
  AuthProviderWithPasswordType,
  ExistingUserOrPartialUserWithPicture,
  SignInUpBaseParams,
} from 'src/engine/core-modules/auth/types/signInUp.type';
import { DomainManagerService } from 'src/engine/core-modules/domain-manager/services/domain-manager.service';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { FileUploadService } from 'src/engine/core-modules/file/file-upload/services/file-upload.service';
import { OnboardingService } from 'src/engine/core-modules/onboarding/onboarding.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { UserService } from 'src/engine/core-modules/user/services/user.service';
import { User } from 'src/engine/core-modules/user/user.entity';
import { WorkspaceInvitationService } from 'src/engine/core-modules/workspace-invitation/services/workspace-invitation.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';

jest.mock('src/utils/image', () => {
  return {
    getImageBufferFromUrl: () => Promise.resolve(Buffer.from('')),
  };
});

describe('SignInUpService', () => {
  let service: SignInUpService;
  let UserRepository: Repository<User>;
  let WorkspaceRepository: Repository<Workspace>;
  let workspaceInvitationService: WorkspaceInvitationService;
  let userWorkspaceService: UserWorkspaceService;
  let twentyConfigService: TwentyConfigService;
  let domainManagerService: DomainManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SignInUpService,
        {
          provide: getRepositoryToken(User, 'core'),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Workspace, 'core'),
          useValue: {
            save: jest.fn(),
            create: jest.fn(),
            get: jest.fn(),
            count: jest.fn(),
          },
        },
        {
          provide: FileUploadService,
          useValue: {
            uploadImage: jest.fn(),
          },
        },
        {
          provide: WorkspaceInvitationService,
          useValue: {
            validatePersonalInvitation: jest.fn(),
            invalidateWorkspaceInvitation: jest.fn(),
          },
        },
        {
          provide: UserWorkspaceService,
          useValue: {
            addUserToWorkspaceIfUserNotInWorkspace: jest.fn(),
            checkUserWorkspaceExists: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: OnboardingService,
          useValue: {
            setOnboardingConnectAccountPending: jest.fn(),
            setOnboardingInviteTeamPending: jest.fn(),
          },
        },
        {
          provide: HttpService,
          useValue: {},
        },
        {
          provide: TwentyConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: UserService,
          useValue: {
            markEmailAsVerified: jest.fn().mockReturnValue({
              id: 'test-user-id',
              email: 'test@test.com',
              isEmailVerified: true,
            } as User),
          },
        },
        {
          provide: DomainManagerService,
          useValue: {
            generateSubdomain: jest.fn(),
          },
        },
        {
          provide: UserRoleService,
          useValue: {
            assignRoleToUserWorkspace: jest.fn(),
          },
        },
        {
          provide: FeatureFlagService,
          useValue: {
            isFeatureEnabled: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SignInUpService>(SignInUpService);
    UserRepository = module.get(getRepositoryToken(User, 'core'));
    WorkspaceRepository = module.get(getRepositoryToken(Workspace, 'core'));
    workspaceInvitationService = module.get<WorkspaceInvitationService>(
      WorkspaceInvitationService,
    );
    userWorkspaceService =
      module.get<UserWorkspaceService>(UserWorkspaceService);
    twentyConfigService = module.get<TwentyConfigService>(TwentyConfigService);
    domainManagerService =
      module.get<DomainManagerService>(DomainManagerService);
  });

  it('should handle signInUp with valid personal invitation', async () => {
    const params: SignInUpBaseParams &
      ExistingUserOrPartialUserWithPicture &
      AuthProviderWithPasswordType = {
      invitation: { value: 'invitationToken' } as AppToken,
      workspace: {
        id: 'workspaceId',
        activationStatus: WorkspaceActivationStatus.ACTIVE,
      } as Workspace,
      authParams: { provider: 'password', password: 'validPassword' },
      userData: {
        type: 'existingUser',
        existingUser: { email: 'test@example.com' } as User,
      },
    };

    jest
      .spyOn(workspaceInvitationService, 'validatePersonalInvitation')
      .mockResolvedValue({
        isValid: true,
        workspace: params.workspace as Workspace,
      });

    jest
      .spyOn(workspaceInvitationService, 'invalidateWorkspaceInvitation')
      .mockResolvedValue(undefined);

    jest
      .spyOn(userWorkspaceService, 'addUserToWorkspaceIfUserNotInWorkspace')
      .mockResolvedValue(undefined);

    const result = await service.signInUp(params);

    expect(result.workspace).toEqual(params.workspace);
    expect(result.user).toBeDefined();
    expect(
      workspaceInvitationService.validatePersonalInvitation,
    ).toHaveBeenCalledWith({
      workspacePersonalInviteToken: 'invitationToken',
      email: 'test@example.com',
    });
    expect(
      workspaceInvitationService.invalidateWorkspaceInvitation,
    ).toHaveBeenCalledWith(
      (params.workspace as Workspace).id,
      'test@example.com',
    );
    expect(
      userWorkspaceService.addUserToWorkspaceIfUserNotInWorkspace,
    ).toHaveBeenCalled();
  });

  it('should handle signInUp on existing workspace without invitation', async () => {
    const params: SignInUpBaseParams &
      ExistingUserOrPartialUserWithPicture &
      AuthProviderWithPasswordType = {
      workspace: {
        id: 'workspaceId',
        activationStatus: WorkspaceActivationStatus.ACTIVE,
      } as Workspace,
      authParams: { provider: 'password', password: 'validPassword' },
      userData: {
        type: 'existingUser',
        existingUser: { email: 'test@example.com' } as User,
      },
    };

    jest
      .spyOn(userWorkspaceService, 'addUserToWorkspaceIfUserNotInWorkspace')
      .mockResolvedValue(undefined);

    const result = await service.signInUp(params);

    expect(result.workspace).toEqual(params.workspace);
    expect(result.user).toBeDefined();
    expect(
      userWorkspaceService.addUserToWorkspaceIfUserNotInWorkspace,
    ).toHaveBeenCalled();
  });

  it('should handle signUp on new workspace for a new user', async () => {
    const params: SignInUpBaseParams &
      ExistingUserOrPartialUserWithPicture &
      AuthProviderWithPasswordType = {
      authParams: { provider: 'password', password: 'validPassword' },
      userData: {
        type: 'newUserWithPicture',
        newUserWithPicture: {
          email: 'newuser@example.com',
          picture: 'pictureUrl',
        },
      },
    };

    jest.spyOn(twentyConfigService, 'get').mockReturnValue(false);
    jest.spyOn(WorkspaceRepository, 'count').mockResolvedValue(0);
    jest.spyOn(WorkspaceRepository, 'create').mockReturnValue({} as Workspace);
    jest.spyOn(WorkspaceRepository, 'save').mockResolvedValue({
      id: 'newWorkspaceId',
      activationStatus: WorkspaceActivationStatus.ACTIVE,
    } as Workspace);
    jest.spyOn(UserRepository, 'create').mockReturnValue({} as User);
    jest
      .spyOn(domainManagerService, 'generateSubdomain')
      .mockResolvedValue('a-subdomain');
    jest
      .spyOn(UserRepository, 'save')

      .mockResolvedValue({ id: 'newUserId' } as User);
    jest
      .spyOn(userWorkspaceService, 'create')
      .mockResolvedValue({} as UserWorkspace);

    const result = await service.signInUp(params);

    expect(result.workspace).toBeDefined();
    expect(result.user).toBeDefined();
    expect(WorkspaceRepository.create).toHaveBeenCalled();
    expect(WorkspaceRepository.save).toHaveBeenCalled();
    expect(UserRepository.create).toHaveBeenCalled();
    expect(UserRepository.save).toHaveBeenCalled();
    expect(userWorkspaceService.create).toHaveBeenCalledWith({
      workspaceId: 'newWorkspaceId',
      userId: 'newUserId',
      isExistingUser: false,
      pictureUrl: 'pictureUrl',
    });
  });

  it('should handle signIn on workspace in pending state', async () => {
    const params: SignInUpBaseParams &
      ExistingUserOrPartialUserWithPicture &
      AuthProviderWithPasswordType = {
      workspace: {
        id: 'workspaceId',
        activationStatus: WorkspaceActivationStatus.PENDING_CREATION,
      } as Workspace,
      authParams: { provider: 'password', password: 'validPassword' },
      userData: {
        type: 'existingUser',
        existingUser: { email: 'test@example.com' } as User,
      },
    };

    jest.spyOn(twentyConfigService, 'get').mockReturnValue(false);
    jest
      .spyOn(userWorkspaceService, 'addUserToWorkspaceIfUserNotInWorkspace')
      .mockResolvedValue(undefined);
    jest
      .spyOn(userWorkspaceService, 'checkUserWorkspaceExists')
      .mockResolvedValue({} as UserWorkspace);

    const result = await service.signInUp(params);

    expect(result.workspace).toEqual(params.workspace);
    expect(result.user).toBeDefined();
    expect(
      userWorkspaceService.addUserToWorkspaceIfUserNotInWorkspace,
    ).toHaveBeenCalled();
  });

  it('should throw - handle signUp on workspace in pending state', async () => {
    const params: SignInUpBaseParams &
      ExistingUserOrPartialUserWithPicture &
      AuthProviderWithPasswordType = {
      workspace: {
        id: 'workspaceId',
        activationStatus: WorkspaceActivationStatus.PENDING_CREATION,
      } as Workspace,
      authParams: { provider: 'password', password: 'validPassword' },
      userData: {
        type: 'existingUser',
        existingUser: { email: 'test@example.com' } as User,
      },
    };

    jest.spyOn(twentyConfigService, 'get').mockReturnValue(false);
    jest
      .spyOn(userWorkspaceService, 'checkUserWorkspaceExists')
      .mockResolvedValue(null);

    await expect(() => service.signInUp(params)).rejects.toThrow(
      new AuthException(
        'User is not part of the workspace',
        AuthExceptionCode.FORBIDDEN_EXCEPTION,
      ),
    );
  });

  it('should handle signup for existing user on new workspace', async () => {
    const params: SignInUpBaseParams &
      ExistingUserOrPartialUserWithPicture &
      AuthProviderWithPasswordType = {
      workspace: null,
      authParams: { provider: 'password', password: 'validPassword' },
      userData: {
        type: 'existingUser',
        existingUser: { email: 'existinguser@example.com' } as User,
      },
    };

    jest.spyOn(twentyConfigService, 'get').mockReturnValue(false);
    jest.spyOn(WorkspaceRepository, 'count').mockResolvedValue(0);
    jest.spyOn(WorkspaceRepository, 'create').mockReturnValue({} as Workspace);
    jest.spyOn(WorkspaceRepository, 'save').mockResolvedValue({
      id: 'newWorkspaceId',
      activationStatus: WorkspaceActivationStatus.PENDING_CREATION,
    } as Workspace);
    jest.spyOn(userWorkspaceService, 'create').mockResolvedValue({} as any);

    const result = await service.signInUp(params);

    expect(result.workspace).toBeDefined();
    expect(result.user).toBeDefined();
    expect(WorkspaceRepository.create).toHaveBeenCalled();
    expect(WorkspaceRepository.save).toHaveBeenCalled();
  });
});
