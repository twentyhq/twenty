import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import bcrypt from 'bcrypt';
import { type Repository } from 'typeorm';

import { AppTokenEntity } from 'src/engine/core-modules/app-token/app-token.entity';
import { AuditService } from 'src/engine/core-modules/audit/services/audit.service';
import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { AuthSsoService } from 'src/engine/core-modules/auth/services/auth-sso.service';
import { SignInUpService } from 'src/engine/core-modules/auth/services/sign-in-up.service';
import { AccessTokenService } from 'src/engine/core-modules/auth/token/services/access-token.service';
import { LoginTokenService } from 'src/engine/core-modules/auth/token/services/login-token.service';
import { RefreshTokenService } from 'src/engine/core-modules/auth/token/services/refresh-token.service';
import { WorkspaceAgnosticTokenService } from 'src/engine/core-modules/auth/token/services/workspace-agnostic-token.service';
import { type ExistingUserOrNewUser } from 'src/engine/core-modules/auth/types/signInUp.type';
import { DomainServerConfigService } from 'src/engine/core-modules/domain/domain-server-config/services/domain-server-config.service';
import { WorkspaceDomainsService } from 'src/engine/core-modules/domain/workspace-domains/services/workspace-domains.service';
import { EmailService } from 'src/engine/core-modules/email/email.service';
import { GuardRedirectService } from 'src/engine/core-modules/guard-redirect/services/guard-redirect.service';
import { I18nService } from 'src/engine/core-modules/i18n/i18n.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { UserService } from 'src/engine/core-modules/user/services/user.service';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { WorkspaceInvitationService } from 'src/engine/core-modules/workspace-invitation/services/workspace-invitation.service';
import { AuthProviderEnum } from 'src/engine/core-modules/workspace/types/workspace.type';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';

import { AuthService } from './auth.service';

jest.mock('bcrypt');

const twentyConfigServiceGetMock = jest.fn();

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;
  let workspaceRepository: Repository<WorkspaceEntity>;
  let userRepository: Repository<UserEntity>;
  let authSsoService: AuthSsoService;
  let userWorkspaceService: UserWorkspaceService;
  let workspaceInvitationService: WorkspaceInvitationService;
  let permissionsService: PermissionsService;
  let signInUpServiceMock: jest.Mocked<
    Pick<SignInUpService, 'validatePassword'>
  >;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(WorkspaceEntity),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(UserEntity),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(AppTokenEntity),
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
          provide: WorkspaceDomainsService,
          useValue: {},
        },
        {
          provide: DomainServerConfigService,
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
          useValue: {
            validatePassword: jest.fn().mockResolvedValue(undefined),
            generateHash: jest.fn(),
          },
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
        {
          provide: I18nService,
          useValue: {
            getI18nInstance: jest.fn().mockReturnValue({
              _: jest.fn().mockReturnValue('mocked-translation'),
            }),
          },
        },
        {
          provide: AuditService,
          useValue: {},
        },
        {
          provide: PermissionsService,
          useValue: {
            userHasWorkspaceSettingPermission: jest
              .fn()
              .mockResolvedValue(false),
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
    workspaceRepository = module.get<Repository<WorkspaceEntity>>(
      getRepositoryToken(WorkspaceEntity),
    );
    userRepository = module.get<Repository<UserEntity>>(
      getRepositoryToken(UserEntity),
    );
    permissionsService = module.get<PermissionsService>(PermissionsService);
    signInUpServiceMock = module.get(SignInUpService) as jest.Mocked<
      Pick<SignInUpService, 'validatePassword'>
    >;
  });

  beforeEach(() => {
    twentyConfigServiceGetMock.mockReturnValue(false);
    signInUpServiceMock.validatePassword.mockClear();
  });

  it('should be defined', async () => {
    expect(service).toBeDefined();
  });

  it('challenge - user already member of workspace', async () => {
    const workspace = { isPasswordAuthEnabled: true } as WorkspaceEntity;
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
    } as unknown as Promise<UserEntity>);

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

  it('allows password login through SSO bypass when user has permission', async () => {
    const workspace = {
      id: 'workspace-id',
      isPasswordAuthEnabled: false,
      isPasswordAuthBypassEnabled: true,
    } as WorkspaceEntity;

    const userEntity = {
      id: 'user-id',
      email: 'email',
      passwordHash: 'password-hash',
      userWorkspaces: [
        {
          id: 'user-workspace-id',
          workspaceId: workspace.id,
        } as any,
      ],
    } as unknown as UserEntity;

    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(userEntity);
    jest
      .spyOn(userWorkspaceService, 'checkUserWorkspaceExists')
      .mockResolvedValueOnce({ id: 'user-workspace-id' } as any);
    jest
      .spyOn(permissionsService, 'userHasWorkspaceSettingPermission')
      .mockResolvedValueOnce(true);

    const response = await service.validateLoginWithPassword(
      {
        email: 'email',
        password: 'password',
        captchaToken: 'captcha-token',
      },
      workspace,
    );

    expect(response).toBe(userEntity);
  });

  it('throws when bypass permission is missing for disabled password auth', async () => {
    const workspace = {
      id: 'workspace-id',
      isPasswordAuthEnabled: false,
      isPasswordAuthBypassEnabled: true,
    } as WorkspaceEntity;

    const userEntity = {
      id: 'user-id',
      email: 'email',
      passwordHash: 'password-hash',
      userWorkspaces: [
        {
          id: 'user-workspace-id',
          workspaceId: workspace.id,
        } as any,
      ],
    } as unknown as UserEntity;

    jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(userEntity);
    jest
      .spyOn(userWorkspaceService, 'checkUserWorkspaceExists')
      .mockResolvedValueOnce(null);
    jest
      .spyOn(permissionsService, 'userHasWorkspaceSettingPermission')
      .mockResolvedValueOnce(false);

    await expect(
      service.validateLoginWithPassword(
        {
          email: 'email',
          password: 'password',
          captchaToken: 'captcha-token',
        },
        workspace,
      ),
    ).rejects.toThrow(
      new AuthException(
        'Email/Password auth is not enabled for this workspace',
        AuthExceptionCode.FORBIDDEN_EXCEPTION,
      ),
    );
    expect(signInUpServiceMock.validatePassword).not.toHaveBeenCalled();
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
      } as unknown as Promise<UserEntity>);

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
      } as WorkspaceEntity,
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
        } as unknown as WorkspaceEntity,
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
          } as unknown as WorkspaceEntity,
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
          } as unknown as WorkspaceEntity,
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
        invitation: {} as AppTokenEntity,
        workspaceInviteHash: undefined,
        workspace: { approvedAccessDomains: [] } as unknown as WorkspaceEntity,
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
        } as unknown as WorkspaceEntity,
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
          } as unknown as WorkspaceEntity,
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
        } as unknown as WorkspaceEntity);
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
        } as unknown as WorkspaceEntity);
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
        .mockResolvedValue({} as WorkspaceEntity);

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
        .mockResolvedValue({} as WorkspaceEntity);

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
