import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { NodeEnvironment } from 'src/engine/core-modules/twenty-config/interfaces/node-environment.interface';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { LoginTokenService } from 'src/engine/core-modules/auth/token/services/login-token.service';
import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/jwt-token-type.enum';
import { WorkspaceDomainsService } from 'src/engine/core-modules/domain/workspace-domains/services/workspace-domains.service';
import { EventLogEmitterService } from 'src/engine/core-modules/event-logs/emit/event-log-emitter.service';
import { ImpersonationAuthorizationService } from 'src/engine/core-modules/impersonation/services/impersonation-authorization.service';
import { ImpersonationService } from 'src/engine/core-modules/impersonation/services/impersonation.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { OTPStatus } from 'src/engine/core-modules/two-factor-authentication/strategies/otp/otp.constants';
import { UserSessionCookieService } from 'src/engine/core-modules/user-session/services/user-session-cookie.service';
import { UserSessionService } from 'src/engine/core-modules/user-session/services/user-session.service';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';

const UserWorkspaceFindOneMock = jest.fn();
const LoginTokenServiceGenerateLoginTokenMock = jest.fn();
const PermissionsServiceUserHasWorkspaceSettingPermissionMock = jest.fn();
const TwentyConfigServiceGetMock = jest.fn();
const UserSessionCreateSessionMock = jest.fn();
const UserSessionRevokeByTokenMock = jest.fn();
const UserSessionResolveSessionMock = jest.fn();
const CookieAttachMock = jest.fn();
const CookieClearMock = jest.fn();
const CookieExtractMock = jest.fn();
const CookieExtractImpersonatorMock = jest.fn();
const CookieClearImpersonatorMock = jest.fn();

describe('ImpersonationService', () => {
  let service: ImpersonationService;

  beforeEach(async () => {
    TwentyConfigServiceGetMock.mockImplementation((key: string) => {
      if (key === 'NODE_ENV') {
        return NodeEnvironment.PRODUCTION;
      }

      return undefined;
    });
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImpersonationService,
        ImpersonationAuthorizationService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: {
            findOne: jest.fn(), // Not used but required by constructor
          },
        },
        {
          provide: getRepositoryToken(UserWorkspaceEntity),
          useValue: {
            findOne: UserWorkspaceFindOneMock,
          },
        },
        {
          provide: LoginTokenService,
          useValue: {
            generateLoginToken: LoginTokenServiceGenerateLoginTokenMock,
          },
        },
        {
          provide: TwentyConfigService,
          useValue: {
            get: TwentyConfigServiceGetMock,
          },
        },
        {
          provide: UserSessionService,
          useValue: {
            createSession: UserSessionCreateSessionMock,
            revokeSessionByToken: UserSessionRevokeByTokenMock,
            resolveSession: UserSessionResolveSessionMock,
          },
        },
        {
          provide: UserSessionCookieService,
          useValue: {
            attachSessionTokenToResponse: CookieAttachMock,
            clearSessionCookie: CookieClearMock,
            extractSessionTokenFromRequest: CookieExtractMock,
            extractImpersonatorSessionTokenFromRequest:
              CookieExtractImpersonatorMock,
            clearImpersonatorSessionCookie: CookieClearImpersonatorMock,
          },
        },
        {
          provide: WorkspaceDomainsService,
          useValue: {
            getWorkspaceUrls: jest.fn().mockReturnValue({
              customUrl: undefined,
              subdomainUrl: 'https://twenty.twenty.com',
            }),
          },
        },
        {
          provide: EventLogEmitterService,
          useValue: {
            createContext: jest.fn().mockReturnValue({
              insertWorkspaceEvent: jest.fn(),
            }),
          },
        },
        {
          provide: PermissionsService,
          useValue: {
            userHasWorkspaceSettingPermission:
              PermissionsServiceUserHasWorkspaceSettingPermissionMock,
          },
        },
      ],
    }).compile();

    service = module.get<ImpersonationService>(ImpersonationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', async () => {
    expect(service).toBeDefined();
  });

  it('should impersonate a user and return workspace and loginToken on success', async () => {
    const mockToImpersonateUserWorkspace = {
      userId: 'target-user-id',
      workspaceId: 'workspace-id',
      user: {
        id: 'target-user-id',
        email: 'target@example.com',
      },
      workspace: {
        id: 'workspace-id',
        allowImpersonation: true,
        subdomain: 'example-subdomain',
      },
    };

    const mockImpersonatorUserWorkspace = {
      id: 'impersonator-user-workspace-id',
      userId: 'impersonator-user-id',
      workspaceId: 'workspace-id',
      user: {
        id: 'impersonator-user-id',
        email: 'impersonator@example.com',
      },
      workspace: {
        id: 'workspace-id',
        allowImpersonation: true,
        subdomain: 'example-subdomain',
      },
      twoFactorAuthenticationMethods: [],
    };

    // Mock first call for target user workspace
    UserWorkspaceFindOneMock.mockResolvedValueOnce(
      mockToImpersonateUserWorkspace,
    );
    // Mock second call for impersonator user workspace
    UserWorkspaceFindOneMock.mockResolvedValueOnce(
      mockImpersonatorUserWorkspace,
    );

    // Mock workspace-level permission check to return true
    PermissionsServiceUserHasWorkspaceSettingPermissionMock.mockResolvedValueOnce(
      true,
    );

    LoginTokenServiceGenerateLoginTokenMock.mockResolvedValueOnce({
      token: 'mock-login-token',
      expiresAt: new Date(),
    });

    const result = await service.impersonate(
      'target-user-id',
      'workspace-id',
      'impersonator-user-workspace-id',
    );

    expect(UserWorkspaceFindOneMock).toHaveBeenCalledTimes(2);

    expect(UserWorkspaceFindOneMock).toHaveBeenNthCalledWith(1, {
      where: {
        userId: 'target-user-id',
        workspaceId: 'workspace-id',
      },
      relations: ['user', 'workspace'],
    });

    expect(UserWorkspaceFindOneMock).toHaveBeenNthCalledWith(2, {
      where: {
        id: 'impersonator-user-workspace-id',
      },
      relations: ['user', 'workspace', 'twoFactorAuthenticationMethods'],
    });

    expect(LoginTokenServiceGenerateLoginTokenMock).toHaveBeenCalledWith(
      'target@example.com',
      'workspace-id',
      'impersonation',
      { impersonatorUserWorkspaceId: 'impersonator-user-workspace-id' },
    );

    expect(result).toEqual({
      workspace: {
        id: 'workspace-id',
        workspaceUrls: {
          customUrl: undefined,
          subdomainUrl: 'https://twenty.twenty.com',
        },
      },
      loginToken: {
        token: 'mock-login-token',
        expiresAt: expect.any(Date),
      },
    });
  });

  it('should allow impersonation within the same workspace even when allowImpersonation is false', async () => {
    const mockToImpersonateUserWorkspace = {
      userId: 'target-user-id',
      workspaceId: 'workspace-id',
      user: { id: 'target-user-id', email: 'target@example.com' },
      workspace: { id: 'workspace-id', allowImpersonation: false },
    };

    const mockImpersonatorUserWorkspace = {
      id: 'impersonator-user-workspace-id',
      userId: 'impersonator-user-id',
      workspaceId: 'workspace-id', // Same workspace ID
      user: { id: 'impersonator-user-id', canImpersonate: false }, // Explicitly set to false
      workspace: { id: 'workspace-id', allowImpersonation: false }, // Same workspace ID
      twoFactorAuthenticationMethods: [],
    };

    UserWorkspaceFindOneMock.mockResolvedValueOnce(
      mockToImpersonateUserWorkspace,
    );
    UserWorkspaceFindOneMock.mockResolvedValueOnce(
      mockImpersonatorUserWorkspace,
    );

    // Mock workspace-level permission check to return true
    PermissionsServiceUserHasWorkspaceSettingPermissionMock.mockResolvedValueOnce(
      true,
    );

    LoginTokenServiceGenerateLoginTokenMock.mockResolvedValueOnce({
      token: 'mock-login-token',
      expiresAt: new Date(),
    });

    // This should succeed because same-workspace impersonation doesn't check allowImpersonation
    const result = await service.impersonate(
      'target-user-id',
      'workspace-id',
      'impersonator-user-workspace-id',
    );

    expect(result).toEqual({
      workspace: {
        id: 'workspace-id',
        workspaceUrls: {
          customUrl: undefined,
          subdomainUrl: 'https://twenty.twenty.com',
        },
      },
      loginToken: {
        token: 'mock-login-token',
        expiresAt: expect.any(Date),
      },
    });
  });

  it('should throw an error when target user is not found', async () => {
    UserWorkspaceFindOneMock.mockResolvedValueOnce(null); // Target user not found
    UserWorkspaceFindOneMock.mockResolvedValueOnce({
      id: 'impersonator-user-workspace-id',
      userId: 'impersonator-user-id',
      workspaceId: 'workspace-id',
      user: { id: 'impersonator-user-id' },
      workspace: { id: 'workspace-id' },
      twoFactorAuthenticationMethods: [],
    });

    await expect(
      service.impersonate(
        'invalid-user-id',
        'workspace-id',
        'impersonator-user-workspace-id',
      ),
    ).rejects.toThrow(
      new AuthException(
        'User not found in workspace or impersonation not enabled',
        AuthExceptionCode.USER_WORKSPACE_NOT_FOUND,
      ),
    );
  });

  it('should throw an error when impersonator user workspace is not found', async () => {
    UserWorkspaceFindOneMock.mockResolvedValueOnce({
      userId: 'target-user-id',
      workspaceId: 'workspace-id',
      user: { id: 'target-user-id' },
      workspace: { id: 'workspace-id' },
    });
    UserWorkspaceFindOneMock.mockResolvedValueOnce(null); // Impersonator workspace not found

    await expect(
      service.impersonate(
        'target-user-id',
        'workspace-id',
        'invalid-impersonator-workspace-id',
      ),
    ).rejects.toThrow(
      new AuthException(
        'User not found in workspace or impersonation not enabled',
        AuthExceptionCode.USER_WORKSPACE_NOT_FOUND,
      ),
    );
  });

  it('should throw an error when impersonating the same user', async () => {
    const sameUserWorkspace = {
      id: 'same-user-workspace-id',
      userId: 'same-user-id',
      workspaceId: 'workspace-id',
      user: {
        id: 'same-user-id',
        email: 'same@example.com',
        canImpersonate: true,
        canAccessFullAdminPanel: false,
      },
      workspace: {
        id: 'workspace-id',
        allowImpersonation: true,
      },
      twoFactorAuthenticationMethods: [],
    };

    UserWorkspaceFindOneMock.mockResolvedValueOnce(sameUserWorkspace);
    UserWorkspaceFindOneMock.mockResolvedValueOnce(sameUserWorkspace);

    await expect(
      service.impersonate(
        'same-user-id',
        'workspace-id',
        'same-user-workspace-id',
      ),
    ).rejects.toThrow(
      new AuthException(
        'User cannot impersonate themselves',
        AuthExceptionCode.FORBIDDEN_EXCEPTION,
      ),
    );

    expect(LoginTokenServiceGenerateLoginTokenMock).not.toHaveBeenCalled();
  });

  it('should throw an error when impersonation is not enabled for the workspace', async () => {
    const mockToImpersonateUserWorkspace = {
      userId: 'target-user-id',
      workspaceId: 'workspace-id',
      user: { id: 'target-user-id', email: 'target@example.com' },
      workspace: { id: 'workspace-id', allowImpersonation: false },
    };

    const mockImpersonatorUserWorkspace = {
      id: 'impersonator-user-workspace-id',
      userId: 'impersonator-user-id',
      workspaceId: 'other-workspace-id',
      user: { id: 'impersonator-user-id' },
      workspace: { id: 'other-workspace-id' },
      twoFactorAuthenticationMethods: [],
    };

    UserWorkspaceFindOneMock.mockResolvedValueOnce(
      mockToImpersonateUserWorkspace,
    );
    UserWorkspaceFindOneMock.mockResolvedValueOnce(
      mockImpersonatorUserWorkspace,
    );

    await expect(
      service.impersonate(
        'target-user-id',
        'workspace-id',
        'impersonator-user-workspace-id',
      ),
    ).rejects.toThrow(
      new AuthException(
        'Server level impersonation not allowed',
        AuthExceptionCode.FORBIDDEN_EXCEPTION,
      ),
    );
  });

  it('should throw an error when impersonation is not enabled at server level for the user', async () => {
    const mockToImpersonateUserWorkspace = {
      userId: 'target-user-id',
      workspaceId: 'target-workspace-id',
      user: { id: 'target-user-id', email: 'target@example.com' },
      workspace: { id: 'target-workspace-id', allowImpersonation: true },
    };

    const mockImpersonatorUserWorkspace = {
      id: 'impersonator-user-workspace-id',
      userId: 'impersonator-user-id',
      workspaceId: 'impersonator-workspace-id',
      user: { id: 'impersonator-user-id', canImpersonate: false },
      workspace: { id: 'impersonator-workspace-id', allowImpersonation: true },
      twoFactorAuthenticationMethods: [],
    };

    UserWorkspaceFindOneMock.mockResolvedValueOnce(
      mockToImpersonateUserWorkspace,
    );
    UserWorkspaceFindOneMock.mockResolvedValueOnce(
      mockImpersonatorUserWorkspace,
    );

    // Mock workspace-level permission check to return false
    PermissionsServiceUserHasWorkspaceSettingPermissionMock.mockResolvedValueOnce(
      false,
    );

    await expect(
      service.impersonate(
        'target-user-id',
        'target-workspace-id',
        'impersonator-user-workspace-id',
      ),
    ).rejects.toThrow(
      new AuthException(
        'Server level impersonation not allowed',
        AuthExceptionCode.FORBIDDEN_EXCEPTION,
      ),
    );
  });

  describe('admin privilege escalation prevention', () => {
    beforeEach(() => {
      PermissionsServiceUserHasWorkspaceSettingPermissionMock.mockReset();
    });

    it('should throw when non-admin tries to impersonate a user with canAccessFullAdminPanel', async () => {
      const mockToImpersonateUserWorkspace = {
        userId: 'target-user-id',
        workspaceId: 'workspace-id',
        user: {
          id: 'target-user-id',
          email: 'admin@example.com',
          canAccessFullAdminPanel: true,
          canImpersonate: false,
        },
        workspace: { id: 'workspace-id', allowImpersonation: true },
      };

      const mockImpersonatorUserWorkspace = {
        id: 'impersonator-user-workspace-id',
        userId: 'impersonator-user-id',
        workspaceId: 'workspace-id',
        user: {
          id: 'impersonator-user-id',
          canImpersonate: false,
          canAccessFullAdminPanel: false,
        },
        workspace: { id: 'workspace-id', allowImpersonation: true },
        twoFactorAuthenticationMethods: [],
      };

      UserWorkspaceFindOneMock.mockResolvedValueOnce(
        mockToImpersonateUserWorkspace,
      );
      UserWorkspaceFindOneMock.mockResolvedValueOnce(
        mockImpersonatorUserWorkspace,
      );

      PermissionsServiceUserHasWorkspaceSettingPermissionMock.mockResolvedValueOnce(
        true,
      );

      await expect(
        service.impersonate(
          'target-user-id',
          'workspace-id',
          'impersonator-user-workspace-id',
        ),
      ).rejects.toThrow(
        new AuthException(
          'Cannot impersonate a user with admin privileges. Only administrators can impersonate other administrators.',
          AuthExceptionCode.FORBIDDEN_EXCEPTION,
        ),
      );
    });

    it('should throw when non-admin tries to impersonate a user with canImpersonate', async () => {
      const mockToImpersonateUserWorkspace = {
        userId: 'target-user-id',
        workspaceId: 'workspace-id',
        user: {
          id: 'target-user-id',
          email: 'admin@example.com',
          canImpersonate: true,
          canAccessFullAdminPanel: false,
        },
        workspace: { id: 'workspace-id', allowImpersonation: true },
      };

      const mockImpersonatorUserWorkspace = {
        id: 'impersonator-user-workspace-id',
        userId: 'impersonator-user-id',
        workspaceId: 'workspace-id',
        user: {
          id: 'impersonator-user-id',
          canImpersonate: false,
          canAccessFullAdminPanel: false,
        },
        workspace: { id: 'workspace-id', allowImpersonation: true },
        twoFactorAuthenticationMethods: [],
      };

      UserWorkspaceFindOneMock.mockResolvedValueOnce(
        mockToImpersonateUserWorkspace,
      );
      UserWorkspaceFindOneMock.mockResolvedValueOnce(
        mockImpersonatorUserWorkspace,
      );

      PermissionsServiceUserHasWorkspaceSettingPermissionMock.mockResolvedValueOnce(
        true,
      );

      await expect(
        service.impersonate(
          'target-user-id',
          'workspace-id',
          'impersonator-user-workspace-id',
        ),
      ).rejects.toThrow(
        new AuthException(
          'Cannot impersonate a user with admin privileges. Only administrators can impersonate other administrators.',
          AuthExceptionCode.FORBIDDEN_EXCEPTION,
        ),
      );
    });

    it('should allow admin to impersonate another admin in the same workspace', async () => {
      const mockToImpersonateUserWorkspace = {
        userId: 'target-user-id',
        workspaceId: 'workspace-id',
        user: {
          id: 'target-user-id',
          email: 'admin@example.com',
          canAccessFullAdminPanel: true,
          canImpersonate: false,
        },
        workspace: { id: 'workspace-id', allowImpersonation: true },
      };

      const mockImpersonatorUserWorkspace = {
        id: 'impersonator-user-workspace-id',
        userId: 'impersonator-user-id',
        workspaceId: 'workspace-id',
        user: {
          id: 'impersonator-user-id',
          canImpersonate: false,
          canAccessFullAdminPanel: true,
        },
        workspace: { id: 'workspace-id', allowImpersonation: true },
        twoFactorAuthenticationMethods: [],
      };

      UserWorkspaceFindOneMock.mockResolvedValueOnce(
        mockToImpersonateUserWorkspace,
      );
      UserWorkspaceFindOneMock.mockResolvedValueOnce(
        mockImpersonatorUserWorkspace,
      );

      PermissionsServiceUserHasWorkspaceSettingPermissionMock.mockResolvedValueOnce(
        true,
      );

      LoginTokenServiceGenerateLoginTokenMock.mockResolvedValueOnce({
        token: 'mock-login-token',
        expiresAt: new Date(),
      });

      const result = await service.impersonate(
        'target-user-id',
        'workspace-id',
        'impersonator-user-workspace-id',
      );

      expect(result).toEqual({
        workspace: {
          id: 'workspace-id',
          workspaceUrls: {
            customUrl: undefined,
            subdomainUrl: 'https://twenty.twenty.com',
          },
        },
        loginToken: {
          token: 'mock-login-token',
          expiresAt: expect.any(Date),
        },
      });
    });
  });

  describe('2FA requirements for server-level impersonation', () => {
    it('should allow server-level impersonation when 2FA is enabled and verified', async () => {
      TwentyConfigServiceGetMock.mockImplementation((key: string) => {
        if (key === 'NODE_ENV') {
          return NodeEnvironment.PRODUCTION;
        }

        return undefined;
      });

      const mockToImpersonateUserWorkspace = {
        userId: 'target-user-id',
        workspaceId: 'target-workspace-id',
        user: { id: 'target-user-id', email: 'target@example.com' },
        workspace: { id: 'target-workspace-id', allowImpersonation: true },
      };

      const mockImpersonatorUserWorkspace = {
        id: 'impersonator-user-workspace-id',
        userId: 'impersonator-user-id',
        workspaceId: 'impersonator-workspace-id',
        user: { id: 'impersonator-user-id', canImpersonate: true },
        workspace: {
          id: 'impersonator-workspace-id',
          allowImpersonation: true,
        },
        twoFactorAuthenticationMethods: [
          {
            id: '2fa-method-id',
            status: OTPStatus.VERIFIED,
            strategy: 'TOTP',
          },
        ],
      };

      UserWorkspaceFindOneMock.mockResolvedValueOnce(
        mockToImpersonateUserWorkspace,
      );
      UserWorkspaceFindOneMock.mockResolvedValueOnce(
        mockImpersonatorUserWorkspace,
      );

      LoginTokenServiceGenerateLoginTokenMock.mockResolvedValueOnce({
        token: 'mock-login-token',
        expiresAt: new Date(),
      });

      const result = await service.impersonate(
        'target-user-id',
        'target-workspace-id',
        'impersonator-user-workspace-id',
      );

      expect(result).toEqual({
        workspace: {
          id: 'target-workspace-id',
          workspaceUrls: {
            customUrl: undefined,
            subdomainUrl: 'https://twenty.twenty.com',
          },
        },
        loginToken: {
          token: 'mock-login-token',
          expiresAt: expect.any(Date),
        },
      });
    });

    it('should throw an error when 2FA is not enabled for server-level impersonation in production', async () => {
      TwentyConfigServiceGetMock.mockImplementation((key: string) => {
        if (key === 'NODE_ENV') {
          return NodeEnvironment.PRODUCTION;
        }

        return undefined;
      });

      const mockToImpersonateUserWorkspace = {
        userId: 'target-user-id',
        workspaceId: 'target-workspace-id',
        user: { id: 'target-user-id', email: 'target@example.com' },
        workspace: { id: 'target-workspace-id', allowImpersonation: true },
      };

      const mockImpersonatorUserWorkspace = {
        id: 'impersonator-user-workspace-id',
        userId: 'impersonator-user-id',
        workspaceId: 'impersonator-workspace-id',
        user: { id: 'impersonator-user-id', canImpersonate: true },
        workspace: {
          id: 'impersonator-workspace-id',
          allowImpersonation: true,
        },
        twoFactorAuthenticationMethods: [], // No 2FA methods
      };

      UserWorkspaceFindOneMock.mockResolvedValueOnce(
        mockToImpersonateUserWorkspace,
      );
      UserWorkspaceFindOneMock.mockResolvedValueOnce(
        mockImpersonatorUserWorkspace,
      );

      await expect(
        service.impersonate(
          'target-user-id',
          'target-workspace-id',
          'impersonator-user-workspace-id',
        ),
      ).rejects.toThrow(
        new AuthException(
          'Two-factor authentication is required for server-level impersonation. Please enable 2FA in your workspace settings before attempting to impersonate users.',
          AuthExceptionCode.TWO_FACTOR_AUTHENTICATION_PROVISION_REQUIRED,
        ),
      );
    });

    it('should throw an error when 2FA is not verified for server-level impersonation in production', async () => {
      TwentyConfigServiceGetMock.mockImplementation((key: string) => {
        if (key === 'NODE_ENV') {
          return NodeEnvironment.PRODUCTION;
        }

        return undefined;
      });

      const mockToImpersonateUserWorkspace = {
        userId: 'target-user-id',
        workspaceId: 'target-workspace-id',
        user: { id: 'target-user-id', email: 'target@example.com' },
        workspace: { id: 'target-workspace-id', allowImpersonation: true },
      };

      const mockImpersonatorUserWorkspace = {
        id: 'impersonator-user-workspace-id',
        userId: 'impersonator-user-id',
        workspaceId: 'impersonator-workspace-id',
        user: { id: 'impersonator-user-id', canImpersonate: true },
        workspace: {
          id: 'impersonator-workspace-id',
          allowImpersonation: true,
        },
        twoFactorAuthenticationMethods: [
          {
            id: '2fa-method-id',
            status: OTPStatus.PENDING, // Not verified
            strategy: 'TOTP',
          },
        ],
      };

      UserWorkspaceFindOneMock.mockResolvedValueOnce(
        mockToImpersonateUserWorkspace,
      );
      UserWorkspaceFindOneMock.mockResolvedValueOnce(
        mockImpersonatorUserWorkspace,
      );

      await expect(
        service.impersonate(
          'target-user-id',
          'target-workspace-id',
          'impersonator-user-workspace-id',
        ),
      ).rejects.toThrow(
        new AuthException(
          'Two-factor authentication is required for server-level impersonation. Please verify your 2FA method before attempting to impersonate users.',
          AuthExceptionCode.TWO_FACTOR_AUTHENTICATION_VERIFICATION_REQUIRED,
        ),
      );
    });

    it('should allow server-level impersonation without 2FA in development environment', async () => {
      TwentyConfigServiceGetMock.mockImplementation((key: string) => {
        if (key === 'NODE_ENV') {
          return NodeEnvironment.DEVELOPMENT;
        }

        return undefined;
      });

      const mockToImpersonateUserWorkspace = {
        userId: 'target-user-id',
        workspaceId: 'target-workspace-id',
        user: { id: 'target-user-id', email: 'target@example.com' },
        workspace: { id: 'target-workspace-id', allowImpersonation: true },
      };

      const mockImpersonatorUserWorkspace = {
        id: 'impersonator-user-workspace-id',
        userId: 'impersonator-user-id',
        workspaceId: 'impersonator-workspace-id',
        user: { id: 'impersonator-user-id', canImpersonate: true },
        workspace: {
          id: 'impersonator-workspace-id',
          allowImpersonation: true,
        },
        twoFactorAuthenticationMethods: [], // No 2FA methods, but should be allowed in dev
      };

      UserWorkspaceFindOneMock.mockResolvedValueOnce(
        mockToImpersonateUserWorkspace,
      );
      UserWorkspaceFindOneMock.mockResolvedValueOnce(
        mockImpersonatorUserWorkspace,
      );

      LoginTokenServiceGenerateLoginTokenMock.mockResolvedValueOnce({
        token: 'mock-login-token',
        expiresAt: new Date(),
      });

      const result = await service.impersonate(
        'target-user-id',
        'target-workspace-id',
        'impersonator-user-workspace-id',
      );

      expect(result).toEqual({
        workspace: {
          id: 'target-workspace-id',
          workspaceUrls: {
            customUrl: undefined,
            subdomainUrl: 'https://twenty.twenty.com',
          },
        },
        loginToken: {
          token: 'mock-login-token',
          expiresAt: expect.any(Date),
        },
      });
    });
  });
  describe('stopImpersonation', () => {
    const buildRequest = () =>
      ({
        headers: {},
        res: {},
      }) as unknown as Parameters<
        ImpersonationService['stopImpersonation']
      >[0]['request'];

    const IMPERSONATOR_USER_WORKSPACE_ID = 'impersonator-user-workspace-id';

    const stopImpersonating = () => {
      UserWorkspaceFindOneMock.mockResolvedValue({
        id: IMPERSONATOR_USER_WORKSPACE_ID,
        userId: 'impersonator-user-id',
        workspaceId: 'workspace-id',
      });

      return service.stopImpersonation({
        impersonationContext: {
          impersonatorUserWorkspaceId: IMPERSONATOR_USER_WORKSPACE_ID,
          impersonatedUserWorkspaceId: 'impersonated-user-workspace-id',
        },
        workspaceId: 'workspace-id',
        request: buildRequest(),
      });
    };

    const parkedSession = (
      overrides: Record<string, unknown> = {},
    ): Record<string, unknown> => ({
      payload: {
        type: JwtTokenTypeEnum.ACCESS,
        userWorkspaceId: IMPERSONATOR_USER_WORKSPACE_ID,
        isImpersonating: false,
        ...overrides,
      },
      authenticatedAt: new Date('2026-01-01T00:00:00.000Z'),
      expiresAt: new Date('2026-07-01T00:00:00.000Z'),
    });

    it('should hand back the parked impersonator session without minting one', async () => {
      CookieExtractMock.mockReturnValue('sess_impersonation');
      CookieExtractImpersonatorMock.mockReturnValue('sess_impersonator');
      UserSessionResolveSessionMock.mockResolvedValue(parkedSession());

      const result = await stopImpersonating();

      expect(result).toEqual({ canRestoreImpersonatorSession: true });
      expect(UserSessionCreateSessionMock).not.toHaveBeenCalled();
      expect(CookieAttachMock).toHaveBeenCalledWith(
        expect.anything(),
        'sess_impersonator',
        new Date('2026-07-01T00:00:00.000Z'),
      );
      expect(CookieClearMock).not.toHaveBeenCalled();
      expect(CookieClearImpersonatorMock).toHaveBeenCalled();
    });

    it('should refuse to restore a session belonging to someone else', async () => {
      CookieExtractMock.mockReturnValue('sess_impersonation');
      CookieExtractImpersonatorMock.mockReturnValue('sess_someone_else');
      UserSessionResolveSessionMock.mockResolvedValue(
        parkedSession({ userWorkspaceId: 'another-user-workspace-id' }),
      );

      const result = await stopImpersonating();

      expect(result).toEqual({ canRestoreImpersonatorSession: false });
      expect(CookieAttachMock).not.toHaveBeenCalled();
      expect(CookieClearMock).toHaveBeenCalled();
    });

    it('should refuse to restore a session that is itself impersonating', async () => {
      CookieExtractMock.mockReturnValue('sess_impersonation');
      CookieExtractImpersonatorMock.mockReturnValue('sess_nested');
      UserSessionResolveSessionMock.mockResolvedValue(
        parkedSession({ isImpersonating: true }),
      );

      const result = await stopImpersonating();

      expect(result).toEqual({ canRestoreImpersonatorSession: false });
      expect(CookieAttachMock).not.toHaveBeenCalled();
    });

    it('should refuse to restore a session revoked while impersonating', async () => {
      CookieExtractMock.mockReturnValue('sess_impersonation');
      CookieExtractImpersonatorMock.mockReturnValue('sess_revoked');
      UserSessionResolveSessionMock.mockRejectedValue(
        new AuthException('nope', AuthExceptionCode.UNAUTHENTICATED),
      );

      const result = await stopImpersonating();

      expect(result).toEqual({ canRestoreImpersonatorSession: false });
      expect(CookieAttachMock).not.toHaveBeenCalled();
      expect(CookieClearMock).toHaveBeenCalled();
    });

    it('should sign out when nothing was parked, as on a cross-workspace host', async () => {
      CookieExtractMock.mockReturnValue('sess_impersonation');
      CookieExtractImpersonatorMock.mockReturnValue(undefined);

      const result = await stopImpersonating();

      expect(result).toEqual({ canRestoreImpersonatorSession: false });
      expect(UserSessionResolveSessionMock).not.toHaveBeenCalled();
      expect(UserSessionCreateSessionMock).not.toHaveBeenCalled();
      expect(CookieAttachMock).not.toHaveBeenCalled();
      expect(CookieClearMock).toHaveBeenCalled();
    });

    it('should revoke the presented impersonation session', async () => {
      UserWorkspaceFindOneMock.mockResolvedValue({
        id: 'impersonator-user-workspace-id',
        userId: 'impersonator-user-id',
        workspaceId: 'workspace-id',
      });
      CookieExtractMock.mockReturnValue('sess_presented');

      await service.stopImpersonation({
        impersonationContext: {
          impersonatorUserWorkspaceId: 'impersonator-user-workspace-id',
          impersonatedUserWorkspaceId: 'impersonated-user-workspace-id',
        },
        workspaceId: 'workspace-id',
        request: buildRequest(),
      });

      expect(UserSessionRevokeByTokenMock).toHaveBeenCalledWith(
        'sess_presented',
        expect.anything(),
      );
    });

    it('should refuse when the request is not impersonating', async () => {
      await expect(
        service.stopImpersonation({
          impersonationContext: undefined,
          workspaceId: 'workspace-id',
          request: buildRequest(),
        }),
      ).rejects.toThrow(AuthException);
    });
  });
});
