import { HttpService } from '@nestjs/axios';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { expect, jest } from '@jest/globals';

import { AppToken } from 'src/engine/core-modules/app-token/app-token.entity';
import { SignInUpService } from 'src/engine/core-modules/auth/services/sign-in-up.service';
import { DomainManagerService } from 'src/engine/core-modules/domain-manager/service/domain-manager.service';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { FileUploadService } from 'src/engine/core-modules/file/file-upload/services/file-upload.service';
import { OnboardingService } from 'src/engine/core-modules/onboarding/onboarding.service';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { User } from 'src/engine/core-modules/user/user.entity';
import { WorkspaceInvitationService } from 'src/engine/core-modules/workspace-invitation/services/workspace-invitation.service';
import { WorkspaceService } from 'src/engine/core-modules/workspace/services/workspace.service';
import { UserService } from 'src/engine/core-modules/user/services/user.service';
import {
  Workspace,
  WorkspaceActivationStatus,
} from 'src/engine/core-modules/workspace/workspace.entity';
import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';

jest.mock('bcrypt');

const UserFindOneMock = jest.fn();
const workspaceInvitationValidateInvitationMock = jest.fn();
const workspaceInvitationInvalidateWorkspaceInvitationMock = jest.fn();
const workspaceInvitationFindInvitationByWorkspaceSubdomainAndUserEmailMock =
  jest.fn();
const userWorkspaceServiceAddUserToWorkspaceMock = jest.fn();
const UserCreateMock = jest.fn();
const UserSaveMock = jest.fn();
const EnvironmentServiceGetMock = jest.fn();
const WorkspaceCreateMock = jest.fn();
const WorkspaceSaveMock = jest.fn();
const WorkspaceFindOneMock = jest.fn();

describe('SignInUpService', () => {
  let service: SignInUpService;
  let userService: UserService;

  afterEach(() => {
    jest.clearAllMocks();
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SignInUpService,
        {
          provide: FileUploadService,
          useValue: {},
        },
        {
          provide: getRepositoryToken(Workspace, 'core'),
          useValue: {
            count: jest.fn().mockReturnValue(1),
            create: WorkspaceCreateMock,
            save: WorkspaceSaveMock,
            findOne: WorkspaceFindOneMock,
          },
        },
        {
          provide: getRepositoryToken(User, 'core'),
          useValue: {
            findOne: UserFindOneMock,
            create: UserCreateMock,
            save: UserSaveMock,
          },
        },
        {
          provide: getRepositoryToken(AppToken, 'core'),
          useValue: {},
        },
        {
          provide: WorkspaceInvitationService,
          useValue: {},
        },
        {
          provide: WorkspaceService,
          useValue: {},
        },
        {
          provide: UserWorkspaceService,
          useValue: {
            addUserToWorkspace: userWorkspaceServiceAddUserToWorkspaceMock,
            create: jest.fn(),
          },
        },
        {
          provide: OnboardingService,
          useValue: {
            setOnboardingConnectAccountPending: jest.fn(),
            setOnboardingInviteTeamPending: jest.fn(),
            setOnboardingCreateProfilePending: jest.fn(),
          },
        },
        {
          provide: HttpService,
          useValue: {},
        },
        {
          provide: EnvironmentService,
          useValue: {
            get: EnvironmentServiceGetMock,
          },
        },
        {
          provide: WorkspaceInvitationService,
          useValue: {
            validateInvitation: workspaceInvitationValidateInvitationMock,
            invalidateWorkspaceInvitation:
              workspaceInvitationInvalidateWorkspaceInvitationMock,
            findInvitationByWorkspaceSubdomainAndUserEmail:
              workspaceInvitationFindInvitationByWorkspaceSubdomainAndUserEmailMock,
          },
        },
        {
          provide: DomainManagerService,
          useValue: {
            generateSubdomain: jest.fn().mockReturnValue('testSubDomain'),
            getWorkspaceBySubdomainOrDefaultWorkspace: jest
              .fn()
              .mockReturnValue({}),
          },
        },
        {
          provide: UserService,
          useValue: {
            hasUserAccessToWorkspaceOrThrow: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SignInUpService>(SignInUpService);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('on mono workspace mode', () => {
    beforeEach(() => {
      EnvironmentServiceGetMock.mockReturnValueOnce(false);
    });
    it('sign up - without invitation', async () => {
      UserFindOneMock.mockReturnValueOnce(false);

      await expect(
        service.signInUp({
          email: 'test@test.com',
          authProvider: 'google',
          invitationFlow: 'none',
          workspace: {
            id: 'workspaceId',
          } as Workspace,
        }),
      ).rejects.toThrow(AuthException);
      expect(WorkspaceCreateMock).not.toHaveBeenCalled();
    });
    it('sign up - with invitation', async () => {
      const email = 'test@test.com';
      const workspace = {
        id: 'workspaceId',
        activationStatus: 'ACTIVE',
        isMicrosoftAuthEnabled: true,
      } as Workspace;

      workspaceInvitationValidateInvitationMock.mockReturnValueOnce({
        isValid: true,
        workspace,
      });

      UserFindOneMock.mockReturnValueOnce({ email } as User);

      const signUpOnNewWorkspaceSpy = jest.spyOn(
        service,
        'signUpOnNewWorkspace',
      );

      const result = await service.signInUp({
        email,
        invitation: {
          workspaceId: workspace.id,
        } as AppToken,
        invitationFlow: 'personal',
        authProvider: 'microsoft',
        workspace,
      });

      expect(signUpOnNewWorkspaceSpy).not.toHaveBeenCalled();

      expect(result).toEqual(
        expect.objectContaining({
          user: expect.objectContaining({ email }),
          workspace: expect.any(Object),
        }),
      );
    });
    it('sign in', async () => {
      const email = 'existing@test.com';
      const existingUser = {
        id: 'user-id',
        email,
        passwordHash: undefined,
      };

      UserFindOneMock.mockReturnValueOnce(existingUser);

      const result = await service.signInUp({
        email,
        authProvider: 'google',
        invitationFlow: 'none',
        workspace: {
          id: 'a-workspace',
          activationStatus: WorkspaceActivationStatus.ACTIVE,
          isGoogleAuthEnabled: true,
        } as Workspace,
      });

      expect(result).toEqual({
        user: existingUser,
        workspace: expect.objectContaining({
          id: 'a-workspace',
        }),
      });
    });
  });
  describe('on multi workspace mode', () => {
    beforeEach(() => {
      EnvironmentServiceGetMock.mockReturnValueOnce(true);
    });
    describe('on main', () => {
      it('sign up - new user', async () => {
        const email = 'test@test.com';

        UserFindOneMock.mockReturnValueOnce(false);

        const spy = jest
          .spyOn(service, 'signUpOnNewWorkspace')
          .mockResolvedValueOnce({ user: {}, workspace: {} } as {
            user: User;
            workspace: Workspace;
          });

        await service.signInUp({
          email: 'test@test.com',
          authProvider: 'google',
          invitationFlow: 'none',
        });

        expect(spy).toHaveBeenCalledWith(
          expect.objectContaining({
            email,
            passwordHash: undefined,
            firstName: expect.any(String),
            lastName: expect.any(String),
            picture: undefined,
          }),
        );
      });
    });
    describe('on workspace', () => {
      it('sign up - new user - with invitation', async () => {
        const email = 'newuser@test.com';
        const workspaceId = 'workspace-id';

        UserFindOneMock.mockReturnValueOnce(null);

        workspaceInvitationValidateInvitationMock.mockReturnValueOnce({
          isValid: true,
          workspace: { id: workspaceId },
        });

        workspaceInvitationInvalidateWorkspaceInvitationMock.mockReturnValueOnce(
          true,
        );

        const spySignInUpOnExistingWorkspace = jest
          .spyOn(service, 'signInUpOnExistingWorkspace')
          .mockResolvedValueOnce(
            {} as Awaited<
              ReturnType<(typeof service)['signInUpOnExistingWorkspace']>
            >,
          );

        await service.signInUp({
          email,
          workspace: {
            id: workspaceId,
            isGoogleAuthEnabled: true,
            activationStatus: WorkspaceActivationStatus.ACTIVE,
          } as Workspace,
          invitation: {
            workspaceId,
          } as AppToken,
          invitationFlow: 'personal',
          authProvider: 'google',
        });

        expect(spySignInUpOnExistingWorkspace).toHaveBeenCalledWith(
          expect.objectContaining({
            email,
            passwordHash: undefined,
            workspace: expect.objectContaining({
              id: workspaceId,
            }),
            firstName: expect.any(String),
            lastName: expect.any(String),
            picture: undefined,
          }),
        );

        expect(
          workspaceInvitationInvalidateWorkspaceInvitationMock,
        ).toHaveBeenCalledWith(workspaceId, email);
      });
      it('sign up - joining user - with invitation', async () => {
        const email = 'existinguser@test.com';
        const workspaceId = 'workspace-id';
        const joiningUser = {
          id: 'user-id',
          email,
          passwordHash: undefined,
        };

        const workspace = {
          id: workspaceId,
          activationStatus: WorkspaceActivationStatus.ACTIVE,
        };

        UserFindOneMock.mockReturnValueOnce(joiningUser);
        workspaceInvitationValidateInvitationMock.mockReturnValueOnce({
          isValid: true,
          workspace,
        });

        workspaceInvitationInvalidateWorkspaceInvitationMock.mockReturnValueOnce(
          true,
        );

        userWorkspaceServiceAddUserToWorkspaceMock.mockReturnValueOnce({});

        const result = await service.signInUp({
          email,
          invitation: {} as AppToken,
          invitationFlow: 'personal',
          authProvider: 'sso',
        });

        expect(result).toEqual({ user: joiningUser, workspace });
        expect(
          userWorkspaceServiceAddUserToWorkspaceMock,
        ).toHaveBeenCalledTimes(1);
        expect(
          workspaceInvitationInvalidateWorkspaceInvitationMock,
        ).toHaveBeenCalledWith(workspaceId, email);
      });
      it('sign up - joining user - without invitation', async () => {
        const email = 'existinguser@test.com';
        const workspaceId = 'workspace-id';
        const newUser = {
          email,
        };

        UserFindOneMock.mockReturnValueOnce(newUser);

        const workspace = {
          id: workspaceId,
          activationStatus: WorkspaceActivationStatus.ACTIVE,
          isGoogleAuthEnabled: true,
        } as Workspace;

        jest
          .spyOn(userService, 'hasUserAccessToWorkspaceOrThrow')
          .mockRejectedValueOnce(
            new AuthException(
              'User does not have access to this workspace',
              AuthExceptionCode.FORBIDDEN_EXCEPTION,
            ),
          );

        await expect(
          service.signInUp({
            email,
            workspace,
            invitationFlow: 'none',
            authProvider: 'google',
          }),
        ).rejects.toThrow(AuthException);
      });
      it('sign up - new user - without invitation', async () => {
        const email = 'newuser@test.com';
        const workspaceId = 'workspace-id';

        const workspace = {
          id: workspaceId,
          activationStatus: WorkspaceActivationStatus.ACTIVE,
          isGoogleAuthEnabled: true,
        } as Workspace;

        UserFindOneMock.mockReturnValueOnce(null);

        await expect(
          service.signInUp({
            email,
            workspace,
            invitationFlow: 'none',
            authProvider: 'google',
          }),
        ).rejects.toThrow(AuthException);
      });
      it('sign in', async () => {
        const email = 'existinguser@test.com';
        const existingUser = {
          id: 'user-id',
          email,
        };

        const workspace = {
          id: 'workspaceId',
          activationStatus: WorkspaceActivationStatus.ACTIVE,
          isGoogleAuthEnabled: true,
        } as Workspace;

        UserFindOneMock.mockReturnValueOnce(existingUser);

        const result = await service.signInUp({
          email,
          authProvider: 'google',
          invitationFlow: 'none',
          workspace: workspace as Workspace,
        });

        expect(result).toEqual({
          user: existingUser,
          workspace: workspace,
        });
      });
    });
  });
});
