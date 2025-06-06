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
import { EmailService } from 'src/engine/core-modules/email/email.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { UserService } from 'src/engine/core-modules/user/services/user.service';
import { User } from 'src/engine/core-modules/user/user.entity';
import { WorkspaceInvitationService } from 'src/engine/core-modules/workspace-invitation/services/workspace-invitation.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { LoginTokenService } from 'src/engine/core-modules/auth/token/services/login-token.service';
import { GuardRedirectService } from 'src/engine/core-modules/guard-redirect/services/guard-redirect.service';
import { AuthProviderEnum } from 'src/engine/core-modules/workspace/types/workspace.type';
import { WorkspaceAgnosticTokenService } from 'src/engine/core-modules/auth/token/services/workspace-agnostic-token.service';
import { DomainManagerService } from 'src/engine/core-modules/domain-manager/services/domain-manager.service';

import { AuthService } from './auth.service';

jest.mock('bcrypt');

const twentyConfigServiceGetMock = jest.fn();

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;
  let workspaceRepository: Repository<Workspace>;
  let userRepository: Repository<User>;
  let authSsoService: AuthSsoService;
  let userWorkspaceService: UserWorkspaceService;
  let workspaceInvitationService: WorkspaceInvitationService;

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
            findOne: jest.fn(),
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
          provide: LoginTokenService,
          useValue: {},
        },
        {
          provide: DomainManagerService,
          useValue: {},
        },
        {
          provide: WorkspaceAgnosticTokenService,
          useValue: {},
        },
        {
          provide: GuardRedirectService,
          useValue: {},
        },
        {
          provide: SignInUpService,
          useValue: {},
        },
        {
          provide: TwentyConfigService,
          useValue: {
            get: twentyConfigServiceGetMock,
          },
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
            checkUserWorkspaceExists: jest.fn(),
            addUserToWorkspaceIfUserNotInWorkspace: jest.fn(),
            findAvailableWorkspacesByEmail: jest.fn(),
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
            getOneWorkspaceInvitation: jest.fn(),
            validatePersonalInvitation: jest.fn(),
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
    workspaceInvitationService = module.get<WorkspaceInvitationService>(
      WorkspaceInvitationService,
    );
    authSsoService = module.get<AuthSsoService>(AuthSsoService);
    userWorkspaceService =
      module.get<UserWorkspaceService>(UserWorkspaceService);
    workspaceRepository = module.get<Repository<Workspace>>(
      getRepositoryToken(Workspace, 'core'),
    );
    userRepository = module.get<Repository<User>>(
      getRepositoryToken(User, 'core'),
    );
  });

  beforeEach(() => {
    twentyConfigServiceGetMock.mockReturnValue(false);
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

    jest.spyOn(userRepository, 'findOne').mockReturnValueOnce({
      email: user.email,
      passwordHash: 'passwordHash',
      captchaToken: user.captchaToken,
    } as unknown as Promise<User>);

    jest
      .spyOn(userWorkspaceService, 'checkUserWorkspaceExists')
      .mockReturnValueOnce({} as any);

    const response = await service.validateLoginWithPassword(
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

    const UserFindOneSpy = jest
      .spyOn(userRepository, 'findOne')
      .mockReturnValueOnce({
        email: user.email,
        passwordHash: 'passwordHash',
        captchaToken: user.captchaToken,
      } as unknown as Promise<User>);

    (bcrypt.compare as jest.Mock).mockReturnValueOnce(true);
    jest
      .spyOn(userWorkspaceService, 'checkUserWorkspaceExists')
      .mockReturnValueOnce(null as any);

    const getOneWorkspaceInvitationSpy = jest
      .spyOn(workspaceInvitationService, 'getOneWorkspaceInvitation')
      .mockReturnValueOnce({} as any);

    const workspaceInvitationValidatePersonalInvitationSpy = jest
      .spyOn(workspaceInvitationService, 'validatePersonalInvitation')
      .mockReturnValueOnce({} as any);

    const addUserToWorkspaceIfUserNotInWorkspaceSpy = jest
      .spyOn(userWorkspaceService, 'addUserToWorkspaceIfUserNotInWorkspace')
      .mockReturnValueOnce({} as any);

    const response = await service.validateLoginWithPassword(
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

    expect(getOneWorkspaceInvitationSpy).toHaveBeenCalledTimes(1);
    expect(
      workspaceInvitationValidatePersonalInvitationSpy,
    ).toHaveBeenCalledTimes(1);
    expect(addUserToWorkspaceIfUserNotInWorkspaceSpy).toHaveBeenCalledTimes(1);
    expect(UserFindOneSpy).toHaveBeenCalledTimes(1);
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
        authProvider: AuthProviderEnum.Password,
        workspaceId: 'workspaceId',
      });

      expect(result).toBeUndefined();
      expect(spyWorkspaceRepository).toHaveBeenCalledTimes(1);
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
        authProvider: AuthProviderEnum.Password,
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
        authProvider: AuthProviderEnum.Password,
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
        authProvider: AuthProviderEnum.Google,
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
        authProvider: AuthProviderEnum.SSO,
        workspaceId: 'workspaceId',
        email: 'email',
      });

      expect(result).toBeDefined();
      expect(spyWorkspaceRepository).toHaveBeenCalledTimes(0);
      expect(spyAuthSsoService).toHaveBeenCalledTimes(1);
    });
  });
});
