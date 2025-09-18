import { Test, type TestingModule } from '@nestjs/testing';
import { getDataSourceToken, getRepositoryToken } from '@nestjs/typeorm';

import { AuditService } from 'src/engine/core-modules/audit/services/audit.service';
import { AuthException } from 'src/engine/core-modules/auth/auth.exception';
import { AccessTokenService } from 'src/engine/core-modules/auth/token/services/access-token.service';
import { RefreshTokenService } from 'src/engine/core-modules/auth/token/services/refresh-token.service';
import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/auth-context.type';
import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { WorkspaceImpersonationService } from 'src/engine/core-modules/workspace-impersonation/services/workspace-impersonation.service';
import { AuthProviderEnum } from 'src/engine/core-modules/workspace/types/workspace.type';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { RoleTargetsEntity } from 'src/engine/metadata-modules/role/role-targets.entity';
import { type RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { RoleService } from 'src/engine/metadata-modules/role/role.service';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';

const mockAuditService = {
  createContext: jest.fn().mockReturnValue({
    insertWorkspaceEvent: jest.fn().mockResolvedValue(undefined),
  }),
};

const mockPermissionsService = {
  checkRolePermissions: jest.fn(),
};

const mockUserRoleService = {
  getRoleIdForUserWorkspace: jest.fn().mockResolvedValue('role-id'),
};

const mockRoleService = {
  getRoleById: jest.fn().mockResolvedValue({ id: 'role-id' }),
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
  manager,
});

const workspaceId = 'ws-1';
const impersonatorUWId = 'uw-impersonator';
const targetUWId = 'uw-target';
const targetUserId = 'user-target';
const impersonatorUserId = 'user-impersonator';

const tokenResult = {
  accessOrWorkspaceAgnosticToken: { token: 'acc', expiresAt: new Date() },
  refreshToken: {
    token: 'ref',
    expiresAt: new Date(),
    targetedTokenType: JwtTokenTypeEnum.ACCESS,
  },
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
    const qbGetOne = jest.fn().mockResolvedValue({
      role: { id: 'role-1', permissionFlags: [] } as unknown as RoleEntity,
    });

    const qb: any = {};

    qb.innerJoinAndSelect = () => qb;
    qb.leftJoinAndSelect = () => qb;
    qb.where = () => qb;
    qb.andWhere = () => qb;
    qb.getOne = qbGetOne;

    manager.createQueryBuilder.mockReturnValue(qb);

    const dataSource = createMockDataSource(manager);

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        WorkspaceImpersonationService,
        { provide: PermissionsService, useValue: mockPermissionsService },
        { provide: UserRoleService, useValue: mockUserRoleService },
        { provide: RoleService, useValue: mockRoleService },
        { provide: AuditService, useValue: mockAuditService },
        { provide: AccessTokenService, useValue: mockAccessTokenService },
        { provide: RefreshTokenService, useValue: mockRefreshTokenService },
        {
          provide: TwentyORMGlobalManager,
          useValue: mockTwentyORMGlobalManager,
        },
        { provide: getDataSourceToken(), useValue: dataSource },
        {
          provide: getRepositoryToken(UserWorkspace),
          useValue: manager,
        },
        {
          provide: getRepositoryToken(RoleTargetsEntity),
          useValue: {
            createQueryBuilder: manager.createQueryBuilder,
          },
        },
      ],
    }).compile();

    service = moduleRef.get(WorkspaceImpersonationService);
    permissionsService = moduleRef.get(PermissionsService);
    accessTokenService = moduleRef.get(AccessTokenService);
    refreshTokenService = moduleRef.get(RefreshTokenService);
    const userRoleService = moduleRef.get(UserRoleService);
    const roleService = moduleRef.get(RoleService);

    return {
      manager,
      dataSource,
      permissionsService,
      accessTokenService,
      refreshTokenService,
      userRoleService,
      roleService,
    };
  };

  it('impersonates successfully by userId', async () => {
    const {
      manager,
      permissionsService,
      accessTokenService,
      refreshTokenService,
    } = await buildModule();

    (
      mockTwentyORMGlobalManager.getRepositoryForWorkspace as jest.Mock
    ).mockResolvedValue({
      findOne: jest
        .fn()
        .mockResolvedValue({ id: 'member-id', userId: targetUserId }),
    });

    manager.findOne
      .mockResolvedValueOnce({
        id: targetUWId,
        workspaceId,
        userId: targetUserId,
      } as UserWorkspace)
      .mockResolvedValueOnce({
        id: impersonatorUWId,
        userId: impersonatorUserId,
      } as UserWorkspace);

    permissionsService.checkRolePermissions.mockReturnValue(true);

    accessTokenService.generateAccessToken.mockResolvedValue(
      tokenResult.accessOrWorkspaceAgnosticToken,
    );
    refreshTokenService.generateRefreshToken.mockResolvedValue(
      tokenResult.refreshToken,
    );

    const result = await service.impersonateWorkspaceUserById({
      workspaceId,
      impersonatorUserWorkspaceId: impersonatorUWId,
      targetUserId: targetUserId,
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
      .mockResolvedValueOnce({
        id: targetUWId,
        workspaceId,
        userId: targetUserId,
      } as UserWorkspace)
      .mockResolvedValueOnce({
        id: impersonatorUWId,
        userId: impersonatorUserId,
      } as UserWorkspace);

    permissionsService.checkRolePermissions.mockReturnValue(false);

    await expect(
      service.impersonateWorkspaceUserById({
        workspaceId,
        impersonatorUserWorkspaceId: impersonatorUWId,
        targetUserId: targetUserId,
      }),
    ).rejects.toThrow(AuthException);
  });

  it('throws when target user workspace is missing', async () => {
    const { manager } = await buildModule();

    // Mock the workspace member repository to return a workspace member
    (
      mockTwentyORMGlobalManager.getRepositoryForWorkspace as jest.Mock
    ).mockResolvedValue({
      findOne: jest
        .fn()
        .mockResolvedValue({ id: 'member-id', userId: targetUserId }),
    });

    manager.findOne.mockResolvedValueOnce(null); // target not found

    await expect(
      service.impersonateWorkspaceUserById({
        workspaceId,
        impersonatorUserWorkspaceId: impersonatorUWId,
        targetUserId: targetUserId,
      }),
    ).rejects.toThrow(AuthException);
  });

  it('impersonates successfully by userId', async () => {
    const {
      manager,
      permissionsService,
      accessTokenService,
      refreshTokenService,
    } = await buildModule();

    (
      mockTwentyORMGlobalManager.getRepositoryForWorkspace as jest.Mock
    ).mockResolvedValue({
      findOne: jest
        .fn()
        .mockResolvedValue({ id: 'wm-1', userId: targetUserId }),
    });

    manager.findOne
      .mockResolvedValueOnce({
        id: targetUWId,
        workspaceId,
        userId: targetUserId,
      } as UserWorkspace)
      .mockResolvedValueOnce({
        id: impersonatorUWId,
        userId: impersonatorUserId,
      } as UserWorkspace);

    permissionsService.checkRolePermissions.mockReturnValue(true);

    accessTokenService.generateAccessToken.mockResolvedValue(
      tokenResult.accessOrWorkspaceAgnosticToken,
    );
    refreshTokenService.generateRefreshToken.mockResolvedValue(
      tokenResult.refreshToken,
    );

    const result = await service.impersonateWorkspaceUserById({
      workspaceId,
      impersonatorUserWorkspaceId: impersonatorUWId,
      targetUserId: targetUserId,
    });

    expect(result.tokens).toEqual(tokenResult);
  });
});
