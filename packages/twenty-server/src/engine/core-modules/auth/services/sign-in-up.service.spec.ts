import { HttpService } from '@nestjs/axios';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { expect, jest } from '@jest/globals';
import bcrypt from 'bcrypt';

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
const WorkspaceCountMock = jest.fn();
const WorkspaceCreateMock = jest.fn();
const WorkspaceSaveMock = jest.fn();
const WorkspaceFindOneMock = jest.fn();

describe('SignInUpService', () => {
  let service: SignInUpService;

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
            count: WorkspaceCountMock,
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
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('authProvider: sso, google, microsoft', () => {
    describe('on main', () => {
      describe('on mono workspace mode', () => {
        beforeEach(() => {
          EnvironmentServiceGetMock.mockReturnValueOnce(false);
        });
        it('sign up - without invitation', async () => {
          UserFindOneMock.mockReturnValueOnce(false);

          workspaceInvitationFindInvitationByWorkspaceSubdomainAndUserEmailMock.mockReturnValueOnce(
            undefined,
          );

          expect(() => {
            service.signInUp({
              email: 'test@test.com',
              authProvider: 'google',
            });
          }).rejects.toThrow(AuthException);
        });
        it('sign up - with invitation in database', async () => {
          const email = 'test@test.com';

          UserFindOneMock.mockReturnValueOnce(false);

          workspaceInvitationFindInvitationByWorkspaceSubdomainAndUserEmailMock.mockReturnValueOnce(
            {},
          );

          const result = await service.signInUp({
            email,
            authProvider: 'microsoft',
          });

          expect(result).toEqual(
            expect.objectContaining({
              user: expect.objectContaining({ email }),
              workspace: expect.any(Object),
            }),
          );
        });
        it('sign up - with invitation token', async () => {
          const email = 'test@test.com';

          UserFindOneMock.mockReturnValueOnce(false);

          workspaceInvitationFindInvitationByWorkspaceSubdomainAndUserEmailMock.mockReturnValueOnce(
            undefined,
          );

          workspaceInvitationValidateInvitationMock.mockReturnValueOnce({});

          const result = await service.signInUp({
            email,
            workspaceInviteHash: 'workspace-invite-hash',
            authProvider: 'sso',
          });

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
          WorkspaceFindOneMock.mockReturnValueOnce({
            id: 'a-workspace',
          });

          const result = await service.signInUp({
            email,
            fromSSO: true,
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
        it('signInUp - sso - on main - new user', async () => {
          const email = 'test@test.com';

          UserFindOneMock.mockReturnValueOnce(false);

          workspaceInvitationFindInvitationByWorkspaceSubdomainAndUserEmailMock.mockReturnValueOnce(
            undefined,
          );

          const spy = jest
            .spyOn(service, 'signUpOnNewWorkspace')
            .mockResolvedValueOnce({ user: {}, workspace: {} } as {
              user: User;
              workspace: Workspace;
            });

          await service.signInUp({
            email: 'test@test.com',
            fromSSO: true,
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
        it('signInUp - sso - on main - existing user', async () => {
          const email = 'existing@test.com';
          const existingUser = {
            id: 'user-id',
            email,
            passwordHash: undefined,
          };

          UserFindOneMock.mockReturnValueOnce(existingUser);
          WorkspaceFindOneMock.mockReturnValueOnce({
            id: 'another-workspace',
          });

          const result = await service.signInUp({
            email,
            fromSSO: true,
          });

          expect(result).toEqual({
            user: existingUser,
            workspace: expect.objectContaining({
              id: 'another-workspace',
            }),
          });
        });
      });
    });
    describe('on workspace', () => {
      it('signInUp - sso - on workspace - new user - existing invitation', async () => {
        const email = 'newuser@test.com';
        const workspaceId = 'workspace-id';

        UserFindOneMock.mockReturnValueOnce(null);
        workspaceInvitationFindInvitationByWorkspaceSubdomainAndUserEmailMock.mockReturnValueOnce(
          {
            value: 'personal-token-value',
          },
        );
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
          fromSSO: true,
          targetWorkspaceSubdomain: 'testSubDomain',
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
      it('signInUp - sso - on workspace - existing user - existing invitation', async () => {
        const email = 'existinguser@test.com';
        const workspaceId = 'workspace-id';
        const existingUser = {
          id: 'user-id',
          email,
          passwordHash: undefined,
        };

        const workspace = {
          id: workspaceId,
          activationStatus: WorkspaceActivationStatus.ACTIVE,
        };

        UserFindOneMock.mockReturnValueOnce(existingUser);
        workspaceInvitationFindInvitationByWorkspaceSubdomainAndUserEmailMock.mockReturnValueOnce(
          {
            value: 'personal-token-value',
          },
        );
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
          fromSSO: true,
          targetWorkspaceSubdomain: 'testSubDomain',
        });

        expect(result).toEqual({ user: existingUser, workspace });
        expect(
          userWorkspaceServiceAddUserToWorkspaceMock,
        ).toHaveBeenCalledTimes(1);
        expect(
          workspaceInvitationInvalidateWorkspaceInvitationMock,
        ).toHaveBeenCalledWith(workspaceId, email);
      });
      it('signInUp - sso - on workspace - new user - personal invitation token', async () => {
        const email = 'newuser@test.com';
        const workspaceId = 'workspace-id';
        const workspacePersonalInviteToken = 'personal-token-value';
        const workspace = {
          id: workspaceId,
          activationStatus: WorkspaceActivationStatus.ACTIVE,
        };

        UserFindOneMock.mockReturnValueOnce(null);

        workspaceInvitationValidateInvitationMock.mockReturnValueOnce({
          isValid: true,
          workspace,
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
          fromSSO: true,
          workspacePersonalInviteToken,
          targetWorkspaceSubdomain: 'testSubDomain',
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
          workspaceInvitationFindInvitationByWorkspaceSubdomainAndUserEmailMock,
        ).not.toHaveBeenCalled();
        expect(
          workspaceInvitationInvalidateWorkspaceInvitationMock,
        ).toHaveBeenCalledWith(workspaceId, email);
      });
      it('signInUp - sso - on workspace - existing user - personal invitation token', async () => {
        const email = 'existinguser@test.com';
        const workspaceId = 'workspace-id';
        const workspacePersonalInviteToken = 'personal-token-value';
        const existingUser = {
          id: 'user-id',
          email,
          passwordHash: undefined,
        };

        UserFindOneMock.mockReturnValueOnce(existingUser);
        workspaceInvitationValidateInvitationMock.mockReturnValueOnce({
          isValid: true,
          workspace: {
            id: workspaceId,
            activationStatus: WorkspaceActivationStatus.ACTIVE,
          },
        });

        workspaceInvitationInvalidateWorkspaceInvitationMock.mockReturnValueOnce(
          true,
        );

        await service.signInUp({
          email,
          fromSSO: true,
          workspacePersonalInviteToken,
          targetWorkspaceSubdomain: 'testSubDomain',
        });

        expect(
          workspaceInvitationInvalidateWorkspaceInvitationMock,
        ).toHaveBeenCalledWith(workspaceId, email);
      });
    });
  });

  describe('credentials', () => {
    it('signInUp - credentials - on workspace - existing user', async () => {
      const email = 'existinguser@test.com';
      const password = 'validPassword123';
      const existingUser = {
        id: 'user-id',
        email,
        passwordHash: 'hash-of-validPassword123',
      };

      UserFindOneMock.mockReturnValueOnce(existingUser);

      EnvironmentServiceGetMock.mockReturnValueOnce(false);

      WorkspaceFindOneMock.mockReturnValueOnce({
        id: 'another-workspace',
      });

      (bcrypt.compare as jest.Mock).mockReturnValueOnce(true);

      await service.signInUp({
        email,
        password,
        fromSSO: false,
        targetWorkspaceSubdomain: 'testSubDomain',
      });

      expect(
        workspaceInvitationInvalidateWorkspaceInvitationMock,
      ).not.toHaveBeenCalled();
    });
    it('signInUp - credentials - on workspace - new user', async () => {
      const email = 'newuser@test.com';
      const password = 'validPassword123';

      UserFindOneMock.mockReturnValueOnce(null);

      UserCreateMock.mockReturnValueOnce({} as User);
      UserSaveMock.mockReturnValueOnce({} as User);

      EnvironmentServiceGetMock.mockReturnValueOnce(true);

      WorkspaceCreateMock.mockReturnValueOnce({});
      WorkspaceSaveMock.mockReturnValueOnce({});

      await service.signInUp({
        email,
        password,
        fromSSO: false,
        targetWorkspaceSubdomain: 'testSubDomain',
      });

      expect(UserCreateMock).toHaveBeenCalledTimes(1);
      expect(UserSaveMock).toHaveBeenCalledTimes(1);

      expect(WorkspaceSaveMock).toHaveBeenCalledTimes(1);
      expect(WorkspaceCreateMock).toHaveBeenCalledTimes(1);
    });
    it('signInUp - credentials - on workspace - new user - personal invitation token', async () => {
      const email = 'newuser@test.com';
      const password = 'validPassword123';
      const workspaceId = 'workspace-id';
      const workspacePersonalInviteToken = 'personal-token-value';

      UserFindOneMock.mockReturnValueOnce(null);
      workspaceInvitationValidateInvitationMock.mockReturnValueOnce({
        isValid: true,
        workspace: {
          id: workspaceId,
          activationStatus: WorkspaceActivationStatus.ACTIVE,
        },
      });

      workspaceInvitationInvalidateWorkspaceInvitationMock.mockReturnValueOnce(
        true,
      );

      UserCreateMock.mockReturnValueOnce({} as User);
      UserSaveMock.mockReturnValueOnce({} as User);

      await service.signInUp({
        email,
        password,
        fromSSO: false,
        workspacePersonalInviteToken,
        targetWorkspaceSubdomain: 'testSubDomain',
      });

      expect(UserCreateMock).toHaveBeenCalledTimes(1);
      expect(UserSaveMock).toHaveBeenCalledTimes(1);

      expect(
        workspaceInvitationInvalidateWorkspaceInvitationMock,
      ).toHaveBeenCalledWith(workspaceId, email);
    });
    it('signInUp - credentials - on workspace - new user - public invitation token', async () => {
      const email = 'newuser@test.com';
      const password = 'validPassword123';
      const workspaceId = 'workspace-id';
      const workspaceInviteHash = 'public-token-value';

      UserFindOneMock.mockReturnValueOnce(null);
      workspaceInvitationValidateInvitationMock.mockReturnValueOnce({
        isValid: true,
        workspace: {
          id: workspaceId,
          activationStatus: WorkspaceActivationStatus.ACTIVE,
        },
      });

      workspaceInvitationInvalidateWorkspaceInvitationMock.mockReturnValueOnce(
        true,
      );

      UserCreateMock.mockReturnValueOnce({} as User);
      UserSaveMock.mockReturnValueOnce({} as User);

      await service.signInUp({
        email,
        password,
        fromSSO: false,
        targetWorkspaceSubdomain: 'testSubDomain',
        workspaceInviteHash,
      });

      expect(UserCreateMock).toHaveBeenCalledTimes(1);
      expect(UserSaveMock).toHaveBeenCalledTimes(1);

      expect(
        workspaceInvitationInvalidateWorkspaceInvitationMock,
      ).toHaveBeenCalledWith(workspaceId, email);
    });
    it('signInUp - credentials - on workspace - new user - without invitation', async () => {
      const email = 'newuser@test.com';
      const password = 'validPassword123';

      UserFindOneMock.mockReturnValueOnce(null);
      workspaceInvitationValidateInvitationMock.mockReturnValueOnce(null);

      await expect(
        service.signInUp({
          email,
          password,
          fromSSO: false,
          targetWorkspaceSubdomain: 'testSubDomain',
        }),
      ).rejects.toThrowError(
        new AuthException(
          'Invitation not found',
          AuthExceptionCode.FORBIDDEN_EXCEPTION,
        ),
      );
    });
  });
  it('signInUp - credentials - new user - existing workspace - without invitation', async () => {
    const email = 'newuser@test.com';
    const password = 'validPassword123';

    UserFindOneMock.mockReturnValueOnce(null);
    workspaceInvitationValidateInvitationMock.mockReturnValueOnce(null);

    await expect(
      service.signInUp({
        email,
        password,
        fromSSO: false,
        targetWorkspaceSubdomain: 'testSubDomain',
      }),
    ).rejects.toThrowError(
      new AuthException(
        'Invitation not found',
        AuthExceptionCode.FORBIDDEN_EXCEPTION,
      ),
    );
  });
});
