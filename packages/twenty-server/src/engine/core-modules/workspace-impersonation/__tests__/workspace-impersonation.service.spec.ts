import { Test, type TestingModule } from '@nestjs/testing';

import { AuditService } from 'src/engine/core-modules/audit/services/audit.service';
import { AuthException } from 'src/engine/core-modules/auth/auth.exception';
import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/auth-context.type';
import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { AuthProviderEnum } from 'src/engine/core-modules/workspace/types/workspace.type';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';

import { AccessTokenService } from 'src/engine/core-modules/auth/token/services/access-token.service';
import { RefreshTokenService } from 'src/engine/core-modules/auth/token/services/refresh-token.service';

import { WorkspaceImpersonationService } from '../services/workspace-impersonation.service';

const mockAuditService = {
  createContext: jest.fn().mockReturnValue({
    insertWorkspaceEvent: jest.fn().mockResolvedValue(undefined),
  }),
};

const mockPermissionsService = {
  checkRolePermissions: jest.fn(),
};

const mockAccessTokenService = {
  generateAccessToken: jest.fn(),
};

const mockRefreshTokenService = {
  generateRefreshToken: jest.fn(),
};

const mockTwentyORMGlobalManager = {
  getRepositoryForWorkspace: jest.fn(),
};

const createMockManager = (overrides: Partial<any> = {}) => ({
  findOne: jest.fn(),
  createQueryBuilder: jest.fn(),
  getRepository: jest.fn(),
  ...overrides,
});

const createMockDataSource = (manager: any) => ({
  transaction: jest.fn(async (fn: (m: any) => Promise<any>) => fn(manager)),
});

const workspaceId = 'ws-1';
const impersonatorUWId = 'uw-impersonator';
const targetUWId = 'uw-target';
const targetUserId = 'user-target';
const impersonatorUserId = 'user-impersonator';

const tokenResult = {
  accessOrWorkspaceAgnosticToken: { token: 'acc', expiresAt: new Date() },
  refreshToken: { token: 'ref', expiresAt: new Date(), targetedTokenType: JwtTokenTypeEnum.ACCESS },
};

describe('WorkspaceImpersonationService', () => {
  let service: WorkspaceImpersonationService;
  let permissionsService: typeof mockPermissionsService;
  let accessTokenService: typeof mockAccessTokenService;
  let refreshTokenService: typeof mockRefreshTokenService;

  beforeEach(async () => {
    jest.clearAllMocks();
  });

  const buildModule = async (managerOverrides: Partial<any> = {}) => {
    const manager = createMockManager(managerOverrides);

    // createQueryBuilder mock to return role + permissionFlags
    const qbGetOne = jest.fn().mockResolvedValue({ role: { id: 'role-1', permissionFlags: [] } as unknown as RoleEntity });
    manager.createQueryBuilder.mockReturnValue({
      innerJoinAndSelect: () => ({ innerJoinAndSelect: () => ({}) } as any),
      where: () => ({ andWhere: () => ({ setLock: () => ({ getOne: qbGetOne }) }) }),
    });

    const dataSource = createMockDataSource(manager);

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        WorkspaceImpersonationService,
        { provide: PermissionsService, useValue: mockPermissionsService },
        { provide: AuditService, useValue: mockAuditService },
        { provide: AccessTokenService, useValue: mockAccessTokenService },
        { provide: RefreshTokenService, useValue: mockRefreshTokenService },
        { provide: TwentyORMGlobalManager, useValue: mockTwentyORMGlobalManager },
        { provide: 'DataSource', useValue: dataSource },
      ],
    })
      .overrideProvider((WorkspaceImpersonationService as any).dependencies?.dataSource ?? 'DataSource')
      .useValue(dataSource)
      .compile();

    service = moduleRef.get(WorkspaceImpersonationService);
    permissionsService = moduleRef.get(PermissionsService) as any;
    accessTokenService = moduleRef.get(AccessTokenService) as any;
    refreshTokenService = moduleRef.get(RefreshTokenService) as any;

    return { manager, dataSource };
  };

  it('impersonates successfully by userWorkspaceId', async () => {
    const { manager } = await buildModule();

    manager.findOne
      .mockResolvedValueOnce({ id: targetUWId, workspaceId, userId: targetUserId } as UserWorkspace)
      .mockResolvedValueOnce({ id: impersonatorUWId, userId: impersonatorUserId } as UserWorkspace);

    permissionsService.checkRolePermissions.mockReturnValue(true);

    accessTokenService.generateAccessToken.mockResolvedValue(
      tokenResult.accessOrWorkspaceAgnosticToken,
    );
    refreshTokenService.generateRefreshToken.mockResolvedValue(
      tokenResult.refreshToken,
    );

    const result = await service.impersonateWorkspaceUser({
      workspaceId,
      impersonatorUserWorkspaceId: impersonatorUWId,
      targetUserWorkspaceId: targetUWId,
    });

    expect(result.tokens).toEqual(tokenResult);
    expect(accessTokenService.generateAccessToken).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: targetUserId,
        workspaceId,
        authProvider: AuthProviderEnum.Impersonation,
        isImpersonating: true,
      }),
    );
    expect(refreshTokenService.generateRefreshToken).toHaveBeenCalledWith(
      expect.objectContaining({ targetedTokenType: JwtTokenTypeEnum.ACCESS }),
    );
  });

  it('throws when permission is denied', async () => {
    const { manager } = await buildModule();

    manager.findOne
      .mockResolvedValueOnce({ id: targetUWId, workspaceId, userId: targetUserId } as UserWorkspace)
      .mockResolvedValueOnce({ id: impersonatorUWId, userId: impersonatorUserId } as UserWorkspace);

    permissionsService.checkRolePermissions.mockReturnValue(false);

    await expect(
      service.impersonateWorkspaceUser({
        workspaceId,
        impersonatorUserWorkspaceId: impersonatorUWId,
        targetUserWorkspaceId: targetUWId,
      }),
    ).rejects.toThrow(AuthException);
  });

  it('throws when target user workspace is missing', async () => {
    const { manager } = await buildModule();

    manager.findOne.mockResolvedValueOnce(null); // target not found

    await expect(
      service.impersonateWorkspaceUser({
        workspaceId,
        impersonatorUserWorkspaceId: impersonatorUWId,
        targetUserWorkspaceId: targetUWId,
      }),
    ).rejects.toThrow(AuthException);
  });

  it('impersonates successfully by workspaceMemberId', async () => {
    const { manager } = await buildModule();

    (mockTwentyORMGlobalManager.getRepositoryForWorkspace as jest.Mock).mockResolvedValue({
      findOne: jest.fn().mockResolvedValue({ id: 'wm-1', userId: targetUserId }),
    });

    manager.findOne
      .mockResolvedValueOnce({ id: targetUWId, workspaceId, userId: targetUserId } as UserWorkspace)
      .mockResolvedValueOnce({ id: impersonatorUWId, userId: impersonatorUserId } as UserWorkspace);

    permissionsService.checkRolePermissions.mockReturnValue(true);
    accessTokenService.generateAccessToken.mockResolvedValue(
      tokenResult.accessOrWorkspaceAgnosticToken,
    );
    refreshTokenService.generateRefreshToken.mockResolvedValue(
      tokenResult.refreshToken,
    );

    const result = await service.impersonateWorkspaceUserByMemberId({
      workspaceId,
      impersonatorUserWorkspaceId: impersonatorUWId,
      targetWorkspaceMemberId: 'wm-1',
    });

    expect(result.tokens).toEqual(tokenResult);
  });
});
