import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import bcrypt from 'bcrypt';
import { Repository } from 'typeorm';

import { AppToken } from 'src/engine/core-modules/app-token/app-token.entity';
import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { AuthSsoService } from 'src/engine/core-modules/auth/services/auth-sso.service';
import { SignInUpService } from 'src/engine/core-modules/auth/services/sign-in-up.service';
import { AccessTokenService } from 'src/engine/core-modules/auth/token/services/access-token.service';
import { RefreshTokenService } from 'src/engine/core-modules/auth/token/services/refresh-token.service';
import { ExistingUserOrNewUser } from 'src/engine/core-modules/auth/types/signInUp.type';
import { DomainManagerService } from 'src/engine/core-modules/domain-manager/services/domain-manager.service';
import { EmailService } from 'src/engine/core-modules/email/email.service';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { UserService } from 'src/engine/core-modules/user/services/user.service';
import { User } from 'src/engine/core-modules/user/user.entity';
import { WorkspaceInvitationService } from 'src/engine/core-modules/workspace-invitation/services/workspace-invitation.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

import { AuthService } from './auth.service';

jest.mock('bcrypt');

const UserFindOneMock = jest.fn();
const UserWorkspacefindOneMock = jest.fn();

const userWorkspaceServiceCheckUserWorkspaceExistsMock = jest.fn();
const workspaceInvitationGetOneWorkspaceInvitationMock = jest.fn();
const workspaceInvitationValidatePersonalInvitationMock = jest.fn();
const userWorkspaceAddUserToWorkspaceMock = jest.fn();

const environmentServiceGetMock = jest.fn();

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;
  let workspaceRepository: Repository<Workspace>;
  let authSsoService: AuthSsoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(Workspace, 'core'),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User, 'core'),
          useValue: {
            findOne: UserFindOneMock,
          },
        },
        {
          provide: getRepositoryToken(AppToken, 'core'),
          useValue: {
            createQueryBuilder: jest.fn().mockReturnValue({
              leftJoin: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              getOne: jest.fn().mockImplementation(() => null),
            }),
          },
        },
        {
          provide: SignInUpService,
          useValue: {},
        },
        {
          provide: EnvironmentService,
          useValue: {
            get: environmentServiceGetMock,
          },
        },
        {
          provide: DomainManagerService,
          useValue: {},
        },
        {
          provide: EmailService,
          useValue: {},
        },
        {
          provide: AccessTokenService,
          useValue: {},
        },
        {
          provide: RefreshTokenService,
          useValue: {},
        },
        {
          provide: UserWorkspaceService,
          useValue: {
            checkUserWorkspaceExists:
              userWorkspaceServiceCheckUserWorkspaceExistsMock,
            addUserToWorkspaceIfUserNotInWorkspace:
              userWorkspaceAddUserToWorkspaceMock,
          },
        },
        {
          provide: UserService,
          useValue: {
            hasUserAccessToWorkspaceOrThrow: jest.fn(),
          },
        },
        {
          provide: WorkspaceInvitationService,
          useValue: {
            getOneWorkspaceInvitation:
              workspaceInvitationGetOneWorkspaceInvitationMock,
            validatePersonalInvitation:
              workspaceInvitationValidatePersonalInvitationMock,
          },
        },
        {
          provide: AuthSsoService,
          useValue: {
            findWorkspaceFromWorkspaceIdOrAuthProvider: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    authSsoService = module.get<AuthSsoService>(AuthSsoService);
    workspaceRepository = module.get<Repository<Workspace>>(
      getRepositoryToken(Workspace, 'core'),
    );
  });

  beforeEach(() => {
    environmentServiceGetMock.mockReturnValue(false);
  });

  it('should be defined', async () => {
    expect(service).toBeDefined();
  });

  it('challenge - user already member of workspace', async () => {
    const workspace = { isPasswordAuthEnabled: true } as Workspace;
    const user = {
      email: 'email',
      password: 'password',
      captchaToken: 'captchaToken',
    };

    (bcrypt.compare as jest.Mock).mockReturnValueOnce(true);

    UserFindOneMock.mockReturnValueOnce({
      email: user.email,
      passwordHash: 'passwordHash',
      captchaToken: user.captchaToken,
    });

    UserWorkspacefindOneMock.mockReturnValueOnce({});

    userWorkspaceServiceCheckUserWorkspaceExistsMock.mockReturnValueOnce({});

    const response = await service.getLoginTokenFromCredentials(
      {
        email: 'email',
        password: 'password',
        captchaToken: 'captchaToken',
      },
      workspace,
    );

    expect(response).toStrictEqual({
      email: user.email,
      passwordHash: 'passwordHash',
      captchaToken: user.captchaToken,
    });
  });

  it('challenge - user who have an invitation', async () => {
    const user = {
      email: 'email',
      password: 'password',
      captchaToken: 'captchaToken',
    };

    UserFindOneMock.mockReturnValueOnce({
      email: user.email,
      passwordHash: 'passwordHash',
      captchaToken: user.captchaToken,
    });

    (bcrypt.compare as jest.Mock).mockReturnValueOnce(true);
    userWorkspaceServiceCheckUserWorkspaceExistsMock.mockReturnValueOnce(false);

    workspaceInvitationGetOneWorkspaceInvitationMock.mockReturnValueOnce({});
    workspaceInvitationValidatePersonalInvitationMock.mockReturnValueOnce({});
    userWorkspaceAddUserToWorkspaceMock.mockReturnValueOnce({});

    const response = await service.getLoginTokenFromCredentials(
      {
        email: 'email',
        password: 'password',
        captchaToken: 'captchaToken',
      },
      {
        isPasswordAuthEnabled: true,
      } as Workspace,
    );

    expect(response).toStrictEqual({
      email: user.email,
      passwordHash: 'passwordHash',
      captchaToken: user.captchaToken,
    });

    expect(
      workspaceInvitationGetOneWorkspaceInvitationMock,
    ).toHaveBeenCalledTimes(1);
    expect(
      workspaceInvitationValidatePersonalInvitationMock,
    ).toHaveBeenCalledTimes(1);
    expect(userWorkspaceAddUserToWorkspaceMock).toHaveBeenCalledTimes(1);
    expect(UserFindOneMock).toHaveBeenCalledTimes(1);
  });

  describe('checkAccessForSignIn', () => {
    it('checkAccessForSignIn - allow signin for existing user who target a workspace with right access', async () => {
      const spy = jest
        .spyOn(userService, 'hasUserAccessToWorkspaceOrThrow')
        .mockResolvedValue();

      await service.checkAccessForSignIn({
        userData: {
          type: 'existingUser',
          existingUser: {
            id: 'user-id',
          },
        } as ExistingUserOrNewUser['userData'],
        invitation: undefined,
        workspaceInviteHash: undefined,
        workspace: {
          id: 'workspace-id',
          isPublicInviteLinkEnabled: true,
          approvedAccessDomains: [],
        } as unknown as Workspace,
      });

      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('checkAccessForSignIn - trigger error on existing user signin in unauthorized workspace', async () => {
      const spy = jest
        .spyOn(userService, 'hasUserAccessToWorkspaceOrThrow')
        .mockRejectedValue(new Error('Access denied'));

      await expect(
        service.checkAccessForSignIn({
          userData: {
            type: 'existingUser',
            existingUser: {
              id: 'user-id',
            },
          } as ExistingUserOrNewUser['userData'],
          invitation: undefined,
          workspaceInviteHash: undefined,
          workspace: {
            id: 'workspace-id',
            isPublicInviteLinkEnabled: true,
            approvedAccessDomains: [],
          } as unknown as Workspace,
        }),
      ).rejects.toThrow(new Error('Access denied'));

      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('checkAccessForSignIn - trigger an error when a user attempts to sign up using a public link in a workspace where public links are disabled', async () => {
      const spy = jest.spyOn(userService, 'hasUserAccessToWorkspaceOrThrow');

      await expect(
        service.checkAccessForSignIn({
          userData: {
            type: 'existingUser',
            existingUser: {
              id: 'user-id',
            },
          } as ExistingUserOrNewUser['userData'],
          invitation: undefined,
          workspaceInviteHash: 'workspaceInviteHash',
          workspace: {
            id: 'workspace-id',
            isPublicInviteLinkEnabled: false,
            approvedAccessDomains: [],
          } as unknown as Workspace,
        }),
      ).rejects.toThrow(
        new AuthException(
          'Public invite link is disabled for this workspace',
          AuthExceptionCode.FORBIDDEN_EXCEPTION,
        ),
      );

      expect(spy).toHaveBeenCalledTimes(0);
    });

    it("checkAccessForSignIn - allow signup for new user who don't target a workspace", async () => {
      const spy = jest
        .spyOn(userService, 'hasUserAccessToWorkspaceOrThrow')
        .mockResolvedValue();

      await service.checkAccessForSignIn({
        userData: {
          type: 'newUser',
          newUserPayload: {},
        } as ExistingUserOrNewUser['userData'],
        invitation: undefined,
        workspaceInviteHash: undefined,
        workspace: undefined,
      });

      expect(spy).toHaveBeenCalledTimes(0);
    });

    it("checkAccessForSignIn - allow signup for existing user who don't target a workspace", async () => {
      const spy = jest
        .spyOn(userService, 'hasUserAccessToWorkspaceOrThrow')
        .mockResolvedValue();

      await service.checkAccessForSignIn({
        userData: {
          type: 'existingUser',
          existingUser: {
            id: 'user-id',
          },
        } as ExistingUserOrNewUser['userData'],
        invitation: undefined,
        workspaceInviteHash: undefined,
        workspace: undefined,
      });

      expect(spy).toHaveBeenCalledTimes(0);
    });

    it('checkAccessForSignIn - allow signup for new user who target a workspace with invitation', async () => {
      const spy = jest
        .spyOn(userService, 'hasUserAccessToWorkspaceOrThrow')
        .mockResolvedValue();

      await service.checkAccessForSignIn({
        userData: {
          type: 'existingUser',
          existingUser: {
            id: 'user-id',
          },
        } as ExistingUserOrNewUser['userData'],
        invitation: {} as AppToken,
        workspaceInviteHash: undefined,
        workspace: { approvedAccessDomains: [] } as unknown as Workspace,
      });

      expect(spy).toHaveBeenCalledTimes(0);
    });

    it('checkAccessForSignIn - allow signup for new user who target a workspace with public invitation', async () => {
      const spy = jest
        .spyOn(userService, 'hasUserAccessToWorkspaceOrThrow')
        .mockResolvedValue();

      await service.checkAccessForSignIn({
        userData: {
          type: 'newUser',
          newUserPayload: {},
        } as ExistingUserOrNewUser['userData'],
        invitation: undefined,
        workspaceInviteHash: 'workspaceInviteHash',
        workspace: {
          isPublicInviteLinkEnabled: true,
          approvedAccessDomains: [],
        } as unknown as Workspace,
      });

      expect(spy).toHaveBeenCalledTimes(0);
    });

    it('checkAccessForSignIn - allow signup for new user who target a workspace with valid trusted domain', async () => {
      expect(async () => {
        await service.checkAccessForSignIn({
          userData: {
            type: 'newUser',
            newUserPayload: {
              email: 'email@domain.com',
            },
          } as ExistingUserOrNewUser['userData'],
          invitation: undefined,
          workspaceInviteHash: 'workspaceInviteHash',
          workspace: {
            isPublicInviteLinkEnabled: true,
            approvedAccessDomains: [
              { domain: 'domain.com', isValidated: true },
            ],
          } as unknown as Workspace,
        });
      }).not.toThrow();
    });
  });

  describe('findWorkspaceForSignInUp', () => {
    it('findWorkspaceForSignInUp - signup password auth', async () => {
      const spyWorkspaceRepository = jest.spyOn(workspaceRepository, 'findOne');
      const spyAuthSsoService = jest.spyOn(
        authSsoService,
        'findWorkspaceFromWorkspaceIdOrAuthProvider',
      );

      const result = await service.findWorkspaceForSignInUp({
        authProvider: 'password',
        workspaceId: 'workspaceId',
      });

      expect(result).toBeUndefined();
      expect(spyWorkspaceRepository).toHaveBeenCalledTimes(0);
      expect(spyAuthSsoService).toHaveBeenCalledTimes(0);
    });
    it('findWorkspaceForSignInUp - signup password auth with workspaceInviteHash', async () => {
      const spyWorkspaceRepository = jest
        .spyOn(workspaceRepository, 'findOne')
        .mockResolvedValue({
          approvedAccessDomains: [],
        } as unknown as Workspace);
      const spyAuthSsoService = jest.spyOn(
        authSsoService,
        'findWorkspaceFromWorkspaceIdOrAuthProvider',
      );

      const result = await service.findWorkspaceForSignInUp({
        authProvider: 'password',
        workspaceId: 'workspaceId',
        workspaceInviteHash: 'workspaceInviteHash',
      });

      expect(result).toBeDefined();
      expect(spyWorkspaceRepository).toHaveBeenCalledTimes(1);
      expect(spyAuthSsoService).toHaveBeenCalledTimes(0);
    });
    it('findWorkspaceForSignInUp - signup social sso auth with workspaceInviteHash', async () => {
      const spyWorkspaceRepository = jest
        .spyOn(workspaceRepository, 'findOne')
        .mockResolvedValue({
          approvedAccessDomains: [],
        } as unknown as Workspace);
      const spyAuthSsoService = jest.spyOn(
        authSsoService,
        'findWorkspaceFromWorkspaceIdOrAuthProvider',
      );

      const result = await service.findWorkspaceForSignInUp({
        authProvider: 'password',
        workspaceId: 'workspaceId',
        workspaceInviteHash: 'workspaceInviteHash',
      });

      expect(result).toBeDefined();
      expect(spyWorkspaceRepository).toHaveBeenCalledTimes(1);
      expect(spyAuthSsoService).toHaveBeenCalledTimes(0);
    });
    it('findWorkspaceForSignInUp - signup social sso auth', async () => {
      const spyWorkspaceRepository = jest.spyOn(workspaceRepository, 'findOne');

      const spyAuthSsoService = jest
        .spyOn(authSsoService, 'findWorkspaceFromWorkspaceIdOrAuthProvider')
        .mockResolvedValue({} as Workspace);

      const result = await service.findWorkspaceForSignInUp({
        authProvider: 'google',
        workspaceId: 'workspaceId',
        email: 'email',
      });

      expect(result).toBeDefined();
      expect(spyWorkspaceRepository).toHaveBeenCalledTimes(0);
      expect(spyAuthSsoService).toHaveBeenCalledTimes(1);
    });
    it('findWorkspaceForSignInUp - sso auth', async () => {
      const spyWorkspaceRepository = jest.spyOn(workspaceRepository, 'findOne');

      const spyAuthSsoService = jest
        .spyOn(authSsoService, 'findWorkspaceFromWorkspaceIdOrAuthProvider')
        .mockResolvedValue({} as Workspace);

      const result = await service.findWorkspaceForSignInUp({
        authProvider: 'sso',
        workspaceId: 'workspaceId',
        email: 'email',
      });

      expect(result).toBeDefined();
      expect(spyWorkspaceRepository).toHaveBeenCalledTimes(0);
      expect(spyAuthSsoService).toHaveBeenCalledTimes(1);
    });
  });
});
