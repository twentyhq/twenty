import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { AuditService } from 'src/engine/core-modules/audit/services/audit.service';
import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { LoginTokenService } from 'src/engine/core-modules/auth/token/services/login-token.service';
import { DomainManagerService } from 'src/engine/core-modules/domain-manager/services/domain-manager.service';
import { ImpersonationService } from 'src/engine/core-modules/impersonation/services/impersonation.service';
import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { User } from 'src/engine/core-modules/user/user.entity';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';

const UserWorkspaceFindOneMock = jest.fn();
const LoginTokenServiceGenerateLoginTokenMock = jest.fn();
const PermissionsServiceUserHasWorkspaceSettingPermissionMock = jest.fn();

describe('ImpersonationService', () => {
  let service: ImpersonationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImpersonationService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(), // Not used but required by constructor
          },
        },
        {
          provide: getRepositoryToken(UserWorkspace),
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
          provide: DomainManagerService,
          useValue: {
            getWorkspaceUrls: jest.fn().mockReturnValue({
              customUrl: undefined,
              subdomainUrl: 'https://twenty.twenty.com',
            }),
          },
        },
        {
          provide: AuditService,
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
      relations: ['user', 'workspace'],
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
        'Impersonation not enabled for the impersonator user or the target workspace',
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
        'Impersonation not enabled for the impersonator user or the target workspace',
        AuthExceptionCode.FORBIDDEN_EXCEPTION,
      ),
    );
  });
});
