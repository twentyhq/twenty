import { randomUUID } from 'crypto';

import { msg } from '@lingui/core/macro';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import {
  type JwtPayload,
  JwtTokenTypeEnum,
} from 'src/engine/core-modules/auth/types/auth-context.type';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

import { JwtAuthStrategy } from './jwt.auth.strategy';

describe('JwtAuthStrategy', () => {
  let strategy: JwtAuthStrategy;
  let userWorkspaceRepository: any;
  let applicationRepository: any;
  let jwtWrapperService: any;
  let permissionsService: any;
  let workspaceCacheService: any;
  let coreEntityCacheService: any;

  const jwt = {
    sub: 'sub-default',
    jti: 'jti-default',
  };

  let workspaceStore: Record<string, any>;
  let userStore: Record<string, any>;
  let apiKeyStore: Record<string, Record<string, any>>;

  beforeEach(() => {
    workspaceStore = {};
    userStore = {};
    apiKeyStore = {};

    userWorkspaceRepository = {
      findOne: jest.fn(),
    };

    applicationRepository = {
      findOne: jest.fn(),
    };

    jwtWrapperService = {
      extractJwtFromRequest: jest.fn(() => () => 'token'),
      resolveVerificationKey: jest.fn(async () => ({
        key: 'mock-key',
        algorithm: 'HS256',
      })),
    };

    permissionsService = {
      userHasWorkspaceSettingPermission: jest.fn(),
    };

    workspaceCacheService = {
      getOrRecompute: jest.fn(
        async (workspaceId: string, cacheKeys: string[]) => {
          const result: Record<string, any> = {};

          if (cacheKeys.includes('flatWorkspaceMemberMaps')) {
            result.flatWorkspaceMemberMaps = {
              byId: {
                'workspace-member-id': {
                  id: 'workspace-member-id',
                  userId: 'valid-user-id',
                  workspaceId: 'workspace-id',
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  deletedAt: null,
                },
              },
              idByUserId: {
                'valid-user-id': 'workspace-member-id',
              },
            };
          }

          if (cacheKeys.includes('apiKeyMap')) {
            result.apiKeyMap = apiKeyStore[workspaceId] ?? {};
          }

          return result;
        },
      ),
    };

    coreEntityCacheService = {
      get: jest.fn(async (keyName: string, entityId: string) => {
        if (keyName === 'workspaceEntity') {
          return workspaceStore[entityId] ?? null;
        }

        if (keyName === 'user') {
          return userStore[entityId] ?? null;
        }

        if (keyName === 'userWorkspaceEntity') {
          return userWorkspaceRepository.findOne({ where: { id: entityId } });
        }

        return null;
      }),
      invalidate: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const createStrategy = () =>
    new JwtAuthStrategy(
      jwtWrapperService,
      applicationRepository,
      userWorkspaceRepository,
      permissionsService,
      workspaceCacheService,
      coreEntityCacheService,
    );

  describe('API_KEY validation', () => {
    it('should throw AuthException if type is API_KEY and workspace is not found', async () => {
      const payload = {
        ...jwt,
        type: JwtTokenTypeEnum.API_KEY,
      };

      strategy = createStrategy();

      await expect(strategy.validate(payload as JwtPayload)).rejects.toThrow(
        new AuthException(
          'Workspace not found',
          AuthExceptionCode.WORKSPACE_NOT_FOUND,
        ),
      );
    });

    it('should throw AuthExceptionCode if type is API_KEY not found', async () => {
      const payload = {
        ...jwt,
        type: JwtTokenTypeEnum.API_KEY,
      };

      const mockWorkspace = new WorkspaceEntity();

      mockWorkspace.id = 'workspace-id';
      workspaceStore[payload.sub] = mockWorkspace;
      apiKeyStore['workspace-id'] = {};

      strategy = createStrategy();

      await expect(strategy.validate(payload as JwtPayload)).rejects.toThrow(
        new AuthException(
          'This API Key is revoked',
          AuthExceptionCode.FORBIDDEN_EXCEPTION,
        ),
      );
    });

    it('should throw AuthExceptionCode if API_KEY is revoked', async () => {
      const payload = {
        ...jwt,
        type: JwtTokenTypeEnum.API_KEY,
      };

      const mockWorkspace = new WorkspaceEntity();

      mockWorkspace.id = 'workspace-id';
      workspaceStore[payload.sub] = mockWorkspace;
      apiKeyStore['workspace-id'] = {
        [payload.jti]: {
          id: 'api-key-id',
          revokedAt: new Date(),
        },
      };

      strategy = createStrategy();

      await expect(strategy.validate(payload as JwtPayload)).rejects.toThrow(
        new AuthException(
          'This API Key is revoked',
          AuthExceptionCode.FORBIDDEN_EXCEPTION,
        ),
      );
    });

    it('should be truthy if type is API_KEY and API_KEY is not revoked', async () => {
      const payload = {
        ...jwt,
        type: JwtTokenTypeEnum.API_KEY,
      };

      const mockWorkspace = new WorkspaceEntity();

      mockWorkspace.id = 'workspace-id';
      workspaceStore[payload.sub] = mockWorkspace;
      apiKeyStore['workspace-id'] = {
        [payload.jti]: {
          id: 'api-key-id',
          revokedAt: null,
        },
      };

      strategy = createStrategy();

      const result = await strategy.validate(payload as JwtPayload);

      expect(result).toBeTruthy();
      expect(result.apiKey?.id).toBe('api-key-id');
    });
  });

  describe('ACCESS token validation', () => {
    it('should throw AuthExceptionCode if type is ACCESS, no jti, and user not found', async () => {
      const validUserId = 'valid-user-id';
      const validUserWorkspaceId = randomUUID();
      const validWorkspaceId = randomUUID();

      const payload = {
        sub: validUserId,
        type: JwtTokenTypeEnum.ACCESS,
        userWorkspaceId: validUserWorkspaceId,
        workspaceId: validWorkspaceId,
      };

      workspaceStore[validWorkspaceId] = new WorkspaceEntity();

      strategy = createStrategy();

      await expect(strategy.validate(payload as JwtPayload)).rejects.toThrow(
        new AuthException(
          'User or user workspace not found',
          expect.any(String),
          {
            userFriendlyMessage: msg`User does not have access to this workspace`,
          },
        ),
      );

      try {
        await strategy.validate(payload as JwtPayload);
      } catch (e) {
        expect(e.code).toBe(AuthExceptionCode.USER_NOT_FOUND);
      }
    });

    it('should throw AuthExceptionCode if type is ACCESS, no jti, and userWorkspace not found', async () => {
      const validUserId = 'valid-user-id';
      const validUserWorkspaceId = randomUUID();
      const validWorkspaceId = randomUUID();

      const payload = {
        sub: validUserId,
        type: JwtTokenTypeEnum.ACCESS,
        userWorkspaceId: validUserWorkspaceId,
        workspaceId: validWorkspaceId,
      };

      workspaceStore[validWorkspaceId] = new WorkspaceEntity();
      userStore[validUserId] = { lastName: 'lastNameDefault' };

      userWorkspaceRepository.findOne.mockResolvedValue(null);

      strategy = createStrategy();

      await expect(strategy.validate(payload as JwtPayload)).rejects.toThrow(
        new AuthException(
          'User or user workspace not found',
          expect.any(String),
          {
            userFriendlyMessage: msg`User does not have access to this workspace`,
          },
        ),
      );

      try {
        await strategy.validate(payload as JwtPayload);
      } catch (e) {
        expect(e.code).toBe(AuthExceptionCode.USER_NOT_FOUND);
      }
    });

    it('should not throw if type is ACCESS, no jti, and user and userWorkspace exist', async () => {
      const validUserId = 'valid-user-id';
      const validUserWorkspaceId = randomUUID();
      const validWorkspaceId = randomUUID();

      const payload = {
        sub: validUserId,
        type: JwtTokenTypeEnum.ACCESS,
        userWorkspaceId: validUserWorkspaceId,
        workspaceId: validWorkspaceId,
      };

      workspaceStore[validWorkspaceId] = new WorkspaceEntity();
      userStore[validUserId] = {
        id: validUserId,
        lastName: 'lastNameDefault',
      };

      coreEntityCacheService.get.mockImplementation(
        async (keyName: string, entityId: string) => {
          if (keyName === 'workspaceEntity') {
            return workspaceStore[entityId] ?? null;
          }

          if (keyName === 'user') {
            return userStore[entityId] ?? null;
          }

          if (keyName === 'userWorkspaceEntity') {
            return {
              id: validUserWorkspaceId,
              user: { id: validUserId, lastName: 'lastNameDefault' },
              workspace: { id: validWorkspaceId },
            };
          }

          return null;
        },
      );

      strategy = createStrategy();

      const user = await strategy.validate(payload as JwtPayload);

      expect(user.user?.lastName).toBe('lastNameDefault');
      expect(user.userWorkspaceId).toBe(validUserWorkspaceId);
    });
  });

  describe('APPLICATION_ACCESS token validation', () => {
    it('should throw AuthExceptionCode if type is APPLICATION_ACCESS, and application not found', async () => {
      const validApplicationId = randomUUID();
      const validWorkspaceId = randomUUID();

      const payload = {
        sub: validApplicationId,
        type: JwtTokenTypeEnum.APPLICATION_ACCESS,
        applicationId: validApplicationId,
        workspaceId: validWorkspaceId,
      };

      workspaceStore[validWorkspaceId] = new WorkspaceEntity();

      applicationRepository.findOne.mockResolvedValue(null);

      strategy = createStrategy();

      await expect(strategy.validate(payload as JwtPayload)).rejects.toThrow(
        new AuthException('Application not found', expect.any(String), {
          userFriendlyMessage: msg`Application not found.`,
        }),
      );

      try {
        await strategy.validate(payload as JwtPayload);
      } catch (e) {
        expect(e.code).toBe(AuthExceptionCode.APPLICATION_NOT_FOUND);
      }
    });
  });

  describe('Impersonation validation', () => {
    it('should throw AuthException if impersonation token has missing impersonatorUserWorkspaceId', async () => {
      const validUserId = 'valid-user-id';
      const validUserWorkspaceId = randomUUID();
      const validWorkspaceId = randomUUID();

      const payload = {
        sub: validUserId,
        type: JwtTokenTypeEnum.ACCESS,
        userWorkspaceId: validUserWorkspaceId,
        workspaceId: validWorkspaceId,
        isImpersonating: true,
        impersonatedUserWorkspaceId: validUserWorkspaceId,
      };

      const mockWorkspace = new WorkspaceEntity();

      mockWorkspace.id = validWorkspaceId;
      workspaceStore[validWorkspaceId] = mockWorkspace;

      userWorkspaceRepository.findOne.mockResolvedValue({
        id: validUserWorkspaceId,
        user: { id: validUserId, lastName: 'lastNameDefault' },
        workspace: { id: validWorkspaceId },
      });

      strategy = createStrategy();

      await expect(strategy.validate(payload as JwtPayload)).rejects.toThrow(
        new AuthException(
          'Invalid or missing user workspace ID in impersonation token',
          AuthExceptionCode.FORBIDDEN_EXCEPTION,
        ),
      );
    });

    it('should throw AuthException if impersonation token has missing impersonatedUserWorkspaceId', async () => {
      const validUserId = 'valid-user-id';
      const validUserWorkspaceId = randomUUID();
      const validWorkspaceId = randomUUID();
      const impersonatorUserWorkspaceId = randomUUID();

      const payload = {
        sub: validUserId,
        type: JwtTokenTypeEnum.ACCESS,
        userWorkspaceId: validUserWorkspaceId,
        workspaceId: validWorkspaceId,
        isImpersonating: true,
        impersonatorUserWorkspaceId,
      };

      const mockWorkspace = new WorkspaceEntity();

      mockWorkspace.id = validWorkspaceId;
      workspaceStore[validWorkspaceId] = mockWorkspace;

      userWorkspaceRepository.findOne.mockResolvedValue({
        id: validUserWorkspaceId,
        user: { id: validUserId, lastName: 'lastNameDefault' },
        workspace: { id: validWorkspaceId },
      });

      strategy = createStrategy();

      await expect(strategy.validate(payload as JwtPayload)).rejects.toThrow(
        new AuthException(
          'Invalid or missing user workspace ID in impersonation token',
          AuthExceptionCode.FORBIDDEN_EXCEPTION,
        ),
      );
    });

    it('should throw AuthException if user tries to impersonate themselves', async () => {
      const validUserId = 'valid-user-id';
      const validUserWorkspaceId = randomUUID();
      const validWorkspaceId = randomUUID();

      const payload = {
        sub: validUserId,
        type: JwtTokenTypeEnum.ACCESS,
        userWorkspaceId: validUserWorkspaceId,
        workspaceId: validWorkspaceId,
        isImpersonating: true,
        impersonatorUserWorkspaceId: validUserWorkspaceId,
        impersonatedUserWorkspaceId: validUserWorkspaceId,
      };

      const mockWorkspace = new WorkspaceEntity();

      mockWorkspace.id = validWorkspaceId;
      workspaceStore[validWorkspaceId] = mockWorkspace;
      userWorkspaceRepository.findOne.mockResolvedValue({
        id: validUserWorkspaceId,
        user: { id: validUserId, lastName: 'lastNameDefault' },
        workspace: { id: validWorkspaceId },
      });
      permissionsService.userHasWorkspaceSettingPermission.mockResolvedValue(
        true,
      );

      strategy = createStrategy();

      await expect(strategy.validate(payload as JwtPayload)).rejects.toThrow(
        new AuthException(
          'User cannot impersonate themselves',
          AuthExceptionCode.FORBIDDEN_EXCEPTION,
        ),
      );
    });

    it('should throw AuthException if impersonator user workspace not found', async () => {
      const validUserId = 'valid-user-id';
      const validUserWorkspaceId = randomUUID();
      const validWorkspaceId = randomUUID();
      const impersonatorUserWorkspaceId = randomUUID();

      const payload = {
        sub: validUserId,
        type: JwtTokenTypeEnum.ACCESS,
        userWorkspaceId: validUserWorkspaceId,
        workspaceId: validWorkspaceId,
        isImpersonating: true,
        impersonatorUserWorkspaceId,
        impersonatedUserWorkspaceId: validUserWorkspaceId,
      };

      const mockWorkspace = new WorkspaceEntity();

      mockWorkspace.id = validWorkspaceId;
      mockWorkspace.allowImpersonation = true;

      const mockUser = { id: validUserId, lastName: 'lastNameDefault' };

      workspaceStore[validWorkspaceId] = mockWorkspace;
      userStore[validUserId] = mockUser;

      coreEntityCacheService.get.mockImplementation(
        async (keyName: string, entityId: string) => {
          if (keyName === 'workspaceEntity') {
            return workspaceStore[entityId] ?? null;
          }

          if (keyName === 'user') {
            return userStore[entityId] ?? null;
          }

          if (keyName === 'userWorkspaceEntity') {
            return {
              id: validUserWorkspaceId,
              user: mockUser,
              workspace: mockWorkspace,
            };
          }

          return null;
        },
      );

      userWorkspaceRepository.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({
          id: validUserWorkspaceId,
          user: { id: 'valid-user-id' },
          workspace: mockWorkspace,
        });

      strategy = createStrategy();

      await expect(strategy.validate(payload as JwtPayload)).rejects.toThrow(
        new AuthException(
          'Invalid impersonation token, cannot find impersonator or impersonated user workspace',
          AuthExceptionCode.USER_WORKSPACE_NOT_FOUND,
          { userFriendlyMessage: msg`User workspace not found.` },
        ),
      );
    });

    it('should throw AuthException if impersonated user workspace not found', async () => {
      const validUserId = 'valid-user-id';
      const validUserWorkspaceId = randomUUID();
      const validWorkspaceId = randomUUID();
      const impersonatorUserWorkspaceId = randomUUID();

      const payload = {
        sub: validUserId,
        type: JwtTokenTypeEnum.ACCESS,
        userWorkspaceId: validUserWorkspaceId,
        workspaceId: validWorkspaceId,
        isImpersonating: true,
        impersonatorUserWorkspaceId,
        impersonatedUserWorkspaceId: validUserWorkspaceId,
      };

      const mockWorkspace = new WorkspaceEntity();

      mockWorkspace.id = validWorkspaceId;
      mockWorkspace.allowImpersonation = true;

      const mockUser = { id: validUserId, lastName: 'lastNameDefault' };

      workspaceStore[validWorkspaceId] = mockWorkspace;
      userStore[validUserId] = mockUser;

      coreEntityCacheService.get.mockImplementation(
        async (keyName: string, entityId: string) => {
          if (keyName === 'workspaceEntity') {
            return workspaceStore[entityId] ?? null;
          }

          if (keyName === 'user') {
            return userStore[entityId] ?? null;
          }

          if (keyName === 'userWorkspaceEntity') {
            return {
              id: validUserWorkspaceId,
              user: mockUser,
              workspace: mockWorkspace,
            };
          }

          return null;
        },
      );

      userWorkspaceRepository.findOne.mockResolvedValueOnce(null);

      strategy = createStrategy();

      await expect(strategy.validate(payload as JwtPayload)).rejects.toThrow(
        new AuthException(
          'Invalid impersonation token, cannot find impersonator or impersonated user workspace',
          AuthExceptionCode.USER_WORKSPACE_NOT_FOUND,
        ),
      );
    });

    it('should throw AuthException for server level impersonation without permission', async () => {
      const validUserId = 'valid-user-id';
      const validUserWorkspaceId = randomUUID();
      const validWorkspaceId = randomUUID();
      const impersonatorUserWorkspaceId = randomUUID();
      const differentWorkspaceId = randomUUID();

      const payload = {
        sub: validUserId,
        type: JwtTokenTypeEnum.ACCESS,
        userWorkspaceId: validUserWorkspaceId,
        workspaceId: validWorkspaceId,
        isImpersonating: true,
        impersonatorUserWorkspaceId,
        impersonatedUserWorkspaceId: validUserWorkspaceId,
      };

      const mockWorkspace = new WorkspaceEntity();

      mockWorkspace.id = validWorkspaceId;
      mockWorkspace.allowImpersonation = false;

      const mockUser = { id: validUserId, lastName: 'lastNameDefault' };

      workspaceStore[validWorkspaceId] = mockWorkspace;
      userStore[validUserId] = mockUser;

      coreEntityCacheService.get.mockImplementation(
        async (keyName: string, entityId: string) => {
          if (keyName === 'workspaceEntity') {
            return workspaceStore[entityId] ?? null;
          }

          if (keyName === 'user') {
            return userStore[entityId] ?? null;
          }

          if (keyName === 'userWorkspaceEntity') {
            return {
              id: validUserWorkspaceId,
              user: mockUser,
              workspace: mockWorkspace,
            };
          }

          return null;
        },
      );

      userWorkspaceRepository.findOne
        .mockResolvedValueOnce({
          id: impersonatorUserWorkspaceId,
          user: { id: 'valid-user-id', canImpersonate: false },
          workspace: { id: differentWorkspaceId },
        })
        .mockResolvedValueOnce({
          id: validUserWorkspaceId,
          user: { id: 'valid-user-id' },
          workspace: mockWorkspace,
        });

      permissionsService.userHasWorkspaceSettingPermission.mockResolvedValue(
        false,
      );

      strategy = createStrategy();

      await expect(strategy.validate(payload as JwtPayload)).rejects.toThrow(
        new AuthException(
          'Server level impersonation not allowed',
          AuthExceptionCode.FORBIDDEN_EXCEPTION,
        ),
      );
    });

    it('should throw AuthException when no impersonation permissions are granted', async () => {
      const validUserId = 'valid-user-id';
      const validUserWorkspaceId = randomUUID();
      const validWorkspaceId = randomUUID();
      const impersonatorUserWorkspaceId = randomUUID();

      const payload = {
        sub: validUserId,
        type: JwtTokenTypeEnum.ACCESS,
        userWorkspaceId: validUserWorkspaceId,
        workspaceId: validWorkspaceId,
        isImpersonating: true,
        impersonatorUserWorkspaceId,
        impersonatedUserWorkspaceId: validUserWorkspaceId,
      };

      const mockWorkspace = new WorkspaceEntity();

      mockWorkspace.id = validWorkspaceId;
      mockWorkspace.allowImpersonation = false;

      const mockUser = { id: validUserId, lastName: 'lastNameDefault' };

      workspaceStore[validWorkspaceId] = mockWorkspace;
      userStore[validUserId] = mockUser;

      coreEntityCacheService.get.mockImplementation(
        async (keyName: string, entityId: string) => {
          if (keyName === 'workspaceEntity') {
            return workspaceStore[entityId] ?? null;
          }

          if (keyName === 'user') {
            return userStore[entityId] ?? null;
          }

          if (keyName === 'userWorkspaceEntity') {
            return {
              id: validUserWorkspaceId,
              user: mockUser,
              workspace: mockWorkspace,
            };
          }

          return null;
        },
      );

      userWorkspaceRepository.findOne
        .mockResolvedValueOnce({
          id: impersonatorUserWorkspaceId,
          user: { id: 'valid-user-id', canImpersonate: false },
          workspace: mockWorkspace,
        })
        .mockResolvedValueOnce({
          id: validUserWorkspaceId,
          user: { id: 'valid-user-id' },
          workspace: mockWorkspace,
        });

      permissionsService.userHasWorkspaceSettingPermission.mockResolvedValue(
        false,
      );

      strategy = createStrategy();

      await expect(strategy.validate(payload as JwtPayload)).rejects.toThrow(
        new AuthException(
          'Impersonation not allowed',
          AuthExceptionCode.FORBIDDEN_EXCEPTION,
        ),
      );
    });

    it('should throw AuthException when impersonatedUserWorkspaceId does not match userWorkspaceId', async () => {
      const validUserId = 'valid-user-id';
      const validUserWorkspaceId = randomUUID();
      const validWorkspaceId = randomUUID();
      const impersonatorUserWorkspaceId = randomUUID();
      const impersonatedUserWorkspaceId = randomUUID();

      const payload = {
        sub: validUserId,
        type: JwtTokenTypeEnum.ACCESS,
        userWorkspaceId: validUserWorkspaceId,
        workspaceId: validWorkspaceId,
        isImpersonating: true,
        impersonatorUserWorkspaceId,
        impersonatedUserWorkspaceId,
      };

      const mockWorkspace = new WorkspaceEntity();

      mockWorkspace.id = validWorkspaceId;
      mockWorkspace.allowImpersonation = true;

      workspaceStore[validWorkspaceId] = mockWorkspace;

      strategy = createStrategy();

      await expect(strategy.validate(payload as JwtPayload)).rejects.toThrow(
        new AuthException(
          'Token user workspace ID does not match impersonated user workspace ID',
          AuthExceptionCode.FORBIDDEN_EXCEPTION,
        ),
      );
    });

    it('should successfully validate workspace level impersonation with permission', async () => {
      const validUserId = 'valid-user-id';
      const validUserWorkspaceId = randomUUID();
      const validWorkspaceId = randomUUID();
      const impersonatorUserWorkspaceId = randomUUID();

      const payload = {
        sub: validUserId,
        type: JwtTokenTypeEnum.ACCESS,
        userWorkspaceId: validUserWorkspaceId,
        workspaceId: validWorkspaceId,
        isImpersonating: true,
        impersonatorUserWorkspaceId,
        impersonatedUserWorkspaceId: validUserWorkspaceId,
      };

      const mockWorkspace = new WorkspaceEntity();

      mockWorkspace.id = validWorkspaceId;
      mockWorkspace.allowImpersonation = false;

      const mockUser = { id: validUserId, lastName: 'lastNameDefault' };

      workspaceStore[validWorkspaceId] = mockWorkspace;
      userStore[validUserId] = mockUser;

      coreEntityCacheService.get.mockImplementation(
        async (keyName: string, entityId: string) => {
          if (keyName === 'workspaceEntity') {
            return workspaceStore[entityId] ?? null;
          }

          if (keyName === 'user') {
            return userStore[entityId] ?? null;
          }

          if (keyName === 'userWorkspaceEntity') {
            return {
              id: validUserWorkspaceId,
              user: mockUser,
              workspace: mockWorkspace,
            };
          }

          return null;
        },
      );

      userWorkspaceRepository.findOne
        .mockResolvedValueOnce({
          id: impersonatorUserWorkspaceId,
          user: { id: 'valid-user-id', canImpersonate: false },
          workspace: mockWorkspace,
        })
        .mockResolvedValueOnce({
          id: validUserWorkspaceId,
          user: mockUser,
          workspace: mockWorkspace,
        });

      permissionsService.userHasWorkspaceSettingPermission.mockResolvedValue(
        true,
      );

      strategy = createStrategy();

      const result = await strategy.validate(payload as JwtPayload);

      expect(result.user?.lastName).toBe('lastNameDefault');
      expect(result.userWorkspaceId).toBe(validUserWorkspaceId);
      expect(result.impersonationContext).toBeDefined();
      expect(result.impersonationContext?.impersonatorUserWorkspaceId).toBe(
        impersonatorUserWorkspaceId,
      );
      expect(result.impersonationContext?.impersonatedUserWorkspaceId).toBe(
        validUserWorkspaceId,
      );
    });

    it('should successfully validate server level impersonation with permission', async () => {
      const validUserId = 'valid-user-id';
      const validUserWorkspaceId = randomUUID();
      const validWorkspaceId = randomUUID();
      const impersonatorUserWorkspaceId = randomUUID();
      const differentWorkspaceId = randomUUID();

      const payload = {
        sub: validUserId,
        type: JwtTokenTypeEnum.ACCESS,
        userWorkspaceId: validUserWorkspaceId,
        workspaceId: validWorkspaceId,
        isImpersonating: true,
        impersonatorUserWorkspaceId,
        impersonatedUserWorkspaceId: validUserWorkspaceId,
      };

      const mockWorkspace = new WorkspaceEntity();

      mockWorkspace.id = validWorkspaceId;
      mockWorkspace.allowImpersonation = true;

      const mockUser = { id: validUserId, lastName: 'lastNameDefault' };

      workspaceStore[validWorkspaceId] = mockWorkspace;
      userStore[validUserId] = mockUser;

      coreEntityCacheService.get.mockImplementation(
        async (keyName: string, entityId: string) => {
          if (keyName === 'workspaceEntity') {
            return workspaceStore[entityId] ?? null;
          }

          if (keyName === 'user') {
            return userStore[entityId] ?? null;
          }

          if (keyName === 'userWorkspaceEntity') {
            return {
              id: validUserWorkspaceId,
              user: mockUser,
              workspace: mockWorkspace,
            };
          }

          return null;
        },
      );

      userWorkspaceRepository.findOne
        .mockResolvedValueOnce({
          id: impersonatorUserWorkspaceId,
          user: { id: 'valid-user-id', canImpersonate: true },
          workspace: { id: differentWorkspaceId },
        })
        .mockResolvedValueOnce({
          id: validUserWorkspaceId,
          user: mockUser,
          workspace: mockWorkspace,
        });

      strategy = createStrategy();

      const result = await strategy.validate(payload as JwtPayload);

      expect(result.user?.lastName).toBe('lastNameDefault');
      expect(result.userWorkspaceId).toBe(validUserWorkspaceId);
      expect(result.impersonationContext).toBeDefined();
      expect(result.impersonationContext?.impersonatorUserWorkspaceId).toBe(
        impersonatorUserWorkspaceId,
      );
      expect(result.impersonationContext?.impersonatedUserWorkspaceId).toBe(
        validUserWorkspaceId,
      );
    });
  });
});
