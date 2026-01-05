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
  let workspaceRepository: any;
  let userWorkspaceRepository: any;
  let userRepository: any;
  let apiKeyRepository: any;
  let applicationRepository: any;
  let jwtWrapperService: any;
  let permissionsService: any;
  let globalWorkspaceOrmManager: any;
  let workspaceMemberRepository: any;

  const jwt = {
    sub: 'sub-default',
    jti: 'jti-default',
  };

  beforeEach(() => {
    workspaceRepository = {
      findOneBy: jest.fn(),
    };

    userRepository = {
      findOne: jest.fn(),
    };

    userWorkspaceRepository = {
      findOne: jest.fn(),
    };

    apiKeyRepository = {
      findOne: jest.fn(),
    };

    applicationRepository = {
      findOne: jest.fn(),
    };

    jwtWrapperService = {
      extractJwtFromRequest: jest.fn(() => () => 'token'),
    };

    permissionsService = {
      userHasWorkspaceSettingPermission: jest.fn(),
    };

    workspaceMemberRepository = {
      findOne: jest.fn(),
    };
    workspaceMemberRepository.findOne.mockResolvedValue({
      id: 'workspace-member-id',
    });

    globalWorkspaceOrmManager = {
      executeInWorkspaceContext: jest.fn(async (_authContext, callback) => {
        return await callback();
      }),
      getRepository: jest.fn(async () => workspaceMemberRepository),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('API_KEY validation', () => {
    it('should throw AuthException if type is API_KEY and workspace is not found', async () => {
      const payload = {
        ...jwt,
        type: JwtTokenTypeEnum.API_KEY,
      };

      workspaceRepository.findOneBy.mockResolvedValue(null);

      strategy = new JwtAuthStrategy(
        jwtWrapperService,
        workspaceRepository,
        applicationRepository,
        userRepository,
        userWorkspaceRepository,
        apiKeyRepository,
        permissionsService,
        globalWorkspaceOrmManager,
      );

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
      workspaceRepository.findOneBy.mockResolvedValue(mockWorkspace);

      apiKeyRepository.findOne.mockResolvedValue(null);

      strategy = new JwtAuthStrategy(
        jwtWrapperService,
        workspaceRepository,
        applicationRepository,
        userRepository,
        userWorkspaceRepository,
        apiKeyRepository,
        permissionsService,
        globalWorkspaceOrmManager,
      );

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
      workspaceRepository.findOneBy.mockResolvedValue(mockWorkspace);

      apiKeyRepository.findOne.mockResolvedValue({
        id: 'api-key-id',
        revokedAt: new Date(),
      });

      strategy = new JwtAuthStrategy(
        jwtWrapperService,
        workspaceRepository,
        applicationRepository,
        userRepository,
        userWorkspaceRepository,
        apiKeyRepository,
        permissionsService,
        globalWorkspaceOrmManager,
      );

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
      workspaceRepository.findOneBy.mockResolvedValue(mockWorkspace);

      apiKeyRepository.findOne.mockResolvedValue({
        id: 'api-key-id',
        revokedAt: null,
      });

      strategy = new JwtAuthStrategy(
        jwtWrapperService,
        workspaceRepository,
        applicationRepository,
        userRepository,
        userWorkspaceRepository,
        apiKeyRepository,
        permissionsService,
        globalWorkspaceOrmManager,
      );

      const result = await strategy.validate(payload as JwtPayload);

      expect(result).toBeTruthy();
      expect(result.apiKey?.id).toBe('api-key-id');

      expect(apiKeyRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: payload.jti,
          workspaceId: mockWorkspace.id,
        },
      });
    });
  });

  describe('ACCESS token validation', () => {
    it('should throw AuthExceptionCode if type is ACCESS, no jti, and user not found', async () => {
      const validUserId = randomUUID();
      const validUserWorkspaceId = randomUUID();
      const validWorkspaceId = randomUUID();

      const payload = {
        sub: validUserId,
        type: JwtTokenTypeEnum.ACCESS,
        userWorkspaceId: validUserWorkspaceId,
        workspaceId: validWorkspaceId,
      };

      workspaceRepository.findOneBy.mockResolvedValue(new WorkspaceEntity());

      userRepository.findOne.mockResolvedValue(null);

      strategy = new JwtAuthStrategy(
        jwtWrapperService,
        workspaceRepository,
        applicationRepository,
        userRepository,
        userWorkspaceRepository,
        apiKeyRepository,
        permissionsService,
        globalWorkspaceOrmManager,
      );

      await expect(strategy.validate(payload as JwtPayload)).rejects.toThrow(
        new AuthException('User not found', expect.any(String), {
          userFriendlyMessage: msg`User does not have access to this workspace.`,
        }),
      );

      try {
        await strategy.validate(payload as JwtPayload);
      } catch (e) {
        expect(e.code).toBe(AuthExceptionCode.USER_NOT_FOUND);
      }
    });

    it('should throw AuthExceptionCode if type is ACCESS, no jti, and userWorkspace not found', async () => {
      const validUserId = randomUUID();
      const validUserWorkspaceId = randomUUID();
      const validWorkspaceId = randomUUID();

      const payload = {
        sub: validUserId,
        type: JwtTokenTypeEnum.ACCESS,
        userWorkspaceId: validUserWorkspaceId,
        workspaceId: validWorkspaceId,
      };

      workspaceRepository.findOneBy.mockResolvedValue(new WorkspaceEntity());

      userRepository.findOne.mockResolvedValue({ lastName: 'lastNameDefault' });

      userWorkspaceRepository.findOne.mockResolvedValue(null);

      strategy = new JwtAuthStrategy(
        jwtWrapperService,
        workspaceRepository,
        applicationRepository,
        userRepository,
        userWorkspaceRepository,
        apiKeyRepository,
        permissionsService,
        globalWorkspaceOrmManager,
      );

      await expect(strategy.validate(payload as JwtPayload)).rejects.toThrow(
        new AuthException('UserWorkspaceEntity not found', expect.any(String), {
          userFriendlyMessage: msg`User does not have access to this workspace.`,
        }),
      );

      try {
        await strategy.validate(payload as JwtPayload);
      } catch (e) {
        expect(e.code).toBe(AuthExceptionCode.USER_WORKSPACE_NOT_FOUND);
      }
    });

    it('should not throw if type is ACCESS, no jti, and user and userWorkspace exist', async () => {
      const validUserId = randomUUID();
      const validUserWorkspaceId = randomUUID();
      const validWorkspaceId = randomUUID();

      const payload = {
        sub: validUserId,
        type: JwtTokenTypeEnum.ACCESS,
        userWorkspaceId: validUserWorkspaceId,
        workspaceId: validWorkspaceId,
      };

      workspaceRepository.findOneBy.mockResolvedValue(new WorkspaceEntity());

      userRepository.findOne.mockResolvedValue({ lastName: 'lastNameDefault' });

      userWorkspaceRepository.findOne.mockResolvedValue({
        id: validUserWorkspaceId,
        user: { id: validUserId, lastName: 'lastNameDefault' },
        workspace: { id: validWorkspaceId },
      });

      strategy = new JwtAuthStrategy(
        jwtWrapperService,
        workspaceRepository,
        applicationRepository,
        userRepository,
        userWorkspaceRepository,
        apiKeyRepository,
        permissionsService,
        globalWorkspaceOrmManager,
      );

      const user = await strategy.validate(payload as JwtPayload);

      expect(user.user?.lastName).toBe('lastNameDefault');
      expect(user.userWorkspaceId).toBe(validUserWorkspaceId);
    });
  });

  describe('APPLICATION token validation', () => {
    it('should throw AuthExceptionCode if type is APPLICATION, and application not found', async () => {
      const validApplicationId = randomUUID();
      const validWorkspaceId = randomUUID();

      const payload = {
        sub: validApplicationId,
        type: JwtTokenTypeEnum.APPLICATION,
        applicationId: validApplicationId,
        workspaceId: validWorkspaceId,
      };

      workspaceRepository.findOneBy.mockResolvedValue(new WorkspaceEntity());

      applicationRepository.findOne.mockResolvedValue(null);

      strategy = new JwtAuthStrategy(
        jwtWrapperService,
        workspaceRepository,
        applicationRepository,
        userRepository,
        userWorkspaceRepository,
        apiKeyRepository,
        permissionsService,
        globalWorkspaceOrmManager,
      );

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
      const validUserId = randomUUID();
      const validUserWorkspaceId = randomUUID();
      const validWorkspaceId = randomUUID();

      const payload = {
        sub: validUserId,
        type: JwtTokenTypeEnum.ACCESS,
        userWorkspaceId: validUserWorkspaceId,
        workspaceId: validWorkspaceId,
        isImpersonating: true,
        impersonatedUserWorkspaceId: validUserWorkspaceId,
        // Missing impersonatorUserWorkspaceId
      };

      const mockUserWorkspace = {
        id: validUserWorkspaceId,
        user: { id: validUserId, lastName: 'lastNameDefault' },
        workspace: { id: validWorkspaceId },
      };

      const mockWorkspace = new WorkspaceEntity();

      mockWorkspace.id = validWorkspaceId;
      workspaceRepository.findOneBy.mockResolvedValue(mockWorkspace);

      userWorkspaceRepository.findOne.mockResolvedValue(mockUserWorkspace);

      strategy = new JwtAuthStrategy(
        jwtWrapperService,
        workspaceRepository,
        applicationRepository,
        userRepository,
        userWorkspaceRepository,
        apiKeyRepository,
        permissionsService,
        globalWorkspaceOrmManager,
      );

      await expect(strategy.validate(payload as JwtPayload)).rejects.toThrow(
        new AuthException(
          'Invalid or missing user workspace ID in impersonation token',
          AuthExceptionCode.FORBIDDEN_EXCEPTION,
        ),
      );
    });

    it('should throw AuthException if impersonation token has missing impersonatedUserWorkspaceId', async () => {
      const validUserId = randomUUID();
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
        // Missing impersonatedUserWorkspaceId
      };

      const mockUserWorkspace = {
        id: validUserWorkspaceId,
        user: { id: validUserId, lastName: 'lastNameDefault' },
        workspace: { id: validWorkspaceId },
      };
      const mockWorkspace = new WorkspaceEntity();

      mockWorkspace.id = validWorkspaceId;
      workspaceRepository.findOneBy.mockResolvedValue(mockWorkspace);

      userWorkspaceRepository.findOne.mockResolvedValue(mockUserWorkspace);

      strategy = new JwtAuthStrategy(
        jwtWrapperService,
        workspaceRepository,
        applicationRepository,
        userRepository,
        userWorkspaceRepository,
        apiKeyRepository,
        permissionsService,
        globalWorkspaceOrmManager,
      );

      await expect(strategy.validate(payload as JwtPayload)).rejects.toThrow(
        new AuthException(
          'Invalid or missing user workspace ID in impersonation token',
          AuthExceptionCode.FORBIDDEN_EXCEPTION,
        ),
      );
    });

    it('should throw AuthException if user tries to impersonate themselves', async () => {
      const validUserId = randomUUID();
      const validUserWorkspaceId = randomUUID();
      const validWorkspaceId = randomUUID();

      const payload = {
        sub: validUserId,
        type: JwtTokenTypeEnum.ACCESS,
        userWorkspaceId: validUserWorkspaceId,
        workspaceId: validWorkspaceId,
        isImpersonating: true,
        impersonatorUserWorkspaceId: validUserWorkspaceId,
        impersonatedUserWorkspaceId: validUserWorkspaceId, // Same as impersonator
      };

      const mockUserWorkspace = {
        id: validUserWorkspaceId,
        user: { id: validUserId, lastName: 'lastNameDefault' },
        workspace: { id: validWorkspaceId },
      };

      const mockWorkspace = new WorkspaceEntity();

      mockWorkspace.id = validWorkspaceId;
      workspaceRepository.findOneBy.mockResolvedValue(mockWorkspace);
      userWorkspaceRepository.findOne.mockResolvedValue(mockUserWorkspace);
      permissionsService.userHasWorkspaceSettingPermission.mockResolvedValue(
        true,
      );

      strategy = new JwtAuthStrategy(
        jwtWrapperService,
        workspaceRepository,
        applicationRepository,
        userRepository,
        userWorkspaceRepository,
        apiKeyRepository,
        permissionsService,
        globalWorkspaceOrmManager,
      );

      await expect(strategy.validate(payload as JwtPayload)).rejects.toThrow(
        new AuthException(
          'User cannot impersonate themselves',
          AuthExceptionCode.FORBIDDEN_EXCEPTION,
        ),
      );
    });

    it('should throw AuthException if impersonator user workspace not found', async () => {
      const validUserId = randomUUID();
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

      const mockUserWorkspace = {
        id: validUserWorkspaceId,
        user: mockUser,
        workspace: mockWorkspace,
      };

      workspaceRepository.findOneBy.mockResolvedValue(mockWorkspace);
      userRepository.findOne.mockResolvedValue(mockUser);
      userWorkspaceRepository.findOne
        .mockResolvedValueOnce(mockUserWorkspace) // For the main userWorkspace lookup
        .mockResolvedValueOnce(null) // For impersonatorUserWorkspace lookup
        .mockResolvedValueOnce({
          // For impersonatedUserWorkspace lookup
          id: validUserWorkspaceId,
          user: { id: randomUUID() },
          workspace: mockWorkspace,
        });

      strategy = new JwtAuthStrategy(
        jwtWrapperService,
        workspaceRepository,
        applicationRepository,
        userRepository,
        userWorkspaceRepository,
        apiKeyRepository,
        permissionsService,
        globalWorkspaceOrmManager,
      );

      await expect(strategy.validate(payload as JwtPayload)).rejects.toThrow(
        new AuthException(
          'Invalid impersonation token, cannot find impersonator or impersonated user workspace',
          AuthExceptionCode.USER_WORKSPACE_NOT_FOUND,
          { userFriendlyMessage: msg`User workspace not found.` },
        ),
      );
    });

    it('should throw AuthException if impersonated user workspace not found', async () => {
      const validUserId = randomUUID();
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

      const mockUserWorkspace = {
        id: validUserWorkspaceId,
        user: mockUser,
        workspace: mockWorkspace,
      };

      workspaceRepository.findOneBy.mockResolvedValue(mockWorkspace);
      userRepository.findOne.mockResolvedValue(mockUser);
      userWorkspaceRepository.findOne
        .mockResolvedValueOnce(mockUserWorkspace) // For the main userWorkspace lookup
        .mockResolvedValueOnce(null); // For impersonatedUserWorkspace lookup

      strategy = new JwtAuthStrategy(
        jwtWrapperService,
        workspaceRepository,
        applicationRepository,
        userRepository,
        userWorkspaceRepository,
        apiKeyRepository,
        permissionsService,
        globalWorkspaceOrmManager,
      );

      await expect(strategy.validate(payload as JwtPayload)).rejects.toThrow(
        new AuthException(
          'Invalid impersonation token, cannot find impersonator or impersonated user workspace',
          AuthExceptionCode.USER_WORKSPACE_NOT_FOUND,
        ),
      );
    });

    it('should throw AuthException for server level impersonation without permission', async () => {
      const validUserId = randomUUID();
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
      mockWorkspace.allowImpersonation = false; // Disabled

      const mockUser = { id: validUserId, lastName: 'lastNameDefault' };

      const mockUserWorkspace = {
        id: validUserWorkspaceId,
        user: mockUser,
        workspace: mockWorkspace,
      };

      const mockImpersonatorUserWorkspace = {
        id: impersonatorUserWorkspaceId,
        user: { id: randomUUID(), canImpersonate: false }, // No server level permission
        workspace: { id: differentWorkspaceId }, // Different workspace
      };

      const mockImpersonatedUserWorkspace = {
        id: validUserWorkspaceId,
        user: { id: randomUUID() },
        workspace: mockWorkspace,
      };

      workspaceRepository.findOneBy.mockResolvedValue(mockWorkspace);
      userRepository.findOne.mockResolvedValue(mockUser);
      userWorkspaceRepository.findOne
        .mockResolvedValueOnce(mockUserWorkspace) // For the main userWorkspace lookup
        .mockResolvedValueOnce(mockImpersonatorUserWorkspace) // For impersonatorUserWorkspace lookup
        .mockResolvedValueOnce(mockImpersonatedUserWorkspace); // For impersonatedUserWorkspace lookup

      permissionsService.userHasWorkspaceSettingPermission.mockResolvedValue(
        false,
      );

      strategy = new JwtAuthStrategy(
        jwtWrapperService,
        workspaceRepository,
        applicationRepository,
        userRepository,
        userWorkspaceRepository,
        apiKeyRepository,
        permissionsService,
        globalWorkspaceOrmManager,
      );

      await expect(strategy.validate(payload as JwtPayload)).rejects.toThrow(
        new AuthException(
          'Server level impersonation not allowed',
          AuthExceptionCode.FORBIDDEN_EXCEPTION,
        ),
      );
    });

    it('should throw AuthException when no impersonation permissions are granted', async () => {
      const validUserId = randomUUID();
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

      const mockUserWorkspace = {
        id: validUserWorkspaceId,
        user: mockUser,
        workspace: mockWorkspace,
      };

      const mockImpersonatorUserWorkspace = {
        id: impersonatorUserWorkspaceId,
        user: { id: randomUUID(), canImpersonate: false },
        workspace: mockWorkspace, // Same workspace
      };

      const mockImpersonatedUserWorkspace = {
        id: validUserWorkspaceId,
        user: { id: randomUUID() },
        workspace: mockWorkspace,
      };

      workspaceRepository.findOneBy.mockResolvedValue(mockWorkspace);
      userRepository.findOne.mockResolvedValue(mockUser);
      userWorkspaceRepository.findOne
        .mockResolvedValueOnce(mockUserWorkspace) // For the main userWorkspace lookup
        .mockResolvedValueOnce(mockImpersonatorUserWorkspace) // For impersonatorUserWorkspace lookup
        .mockResolvedValueOnce(mockImpersonatedUserWorkspace); // For impersonatedUserWorkspace lookup

      permissionsService.userHasWorkspaceSettingPermission.mockResolvedValue(
        false,
      );

      strategy = new JwtAuthStrategy(
        jwtWrapperService,
        workspaceRepository,
        applicationRepository,
        userRepository,
        userWorkspaceRepository,
        apiKeyRepository,
        permissionsService,
        globalWorkspaceOrmManager,
      );

      await expect(strategy.validate(payload as JwtPayload)).rejects.toThrow(
        new AuthException(
          'Impersonation not allowed',
          AuthExceptionCode.FORBIDDEN_EXCEPTION,
        ),
      );
    });

    it('should throw AuthException when impersonatedUserWorkspaceId does not match userWorkspaceId', async () => {
      const validUserId = randomUUID();
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
        impersonatedUserWorkspaceId, // Different from userWorkspaceId
      };

      const mockWorkspace = new WorkspaceEntity();

      mockWorkspace.id = validWorkspaceId;
      mockWorkspace.allowImpersonation = true;

      const mockUser = { id: validUserId, lastName: 'lastNameDefault' };

      const mockUserWorkspace = {
        id: validUserWorkspaceId,
        user: mockUser,
        workspace: mockWorkspace,
      };

      const mockImpersonatorUserWorkspace = {
        id: impersonatorUserWorkspaceId,
        user: { id: randomUUID(), canImpersonate: true },
        workspace: mockWorkspace,
      };

      const mockImpersonatedUserWorkspace = {
        id: impersonatedUserWorkspaceId,
        user: { id: randomUUID() },
        workspace: mockWorkspace,
      };

      workspaceRepository.findOneBy.mockResolvedValue(mockWorkspace);
      userRepository.findOne.mockResolvedValue(mockUser);
      userWorkspaceRepository.findOne
        .mockResolvedValueOnce(mockUserWorkspace) // For the main userWorkspace lookup
        .mockResolvedValueOnce(mockImpersonatorUserWorkspace) // For impersonatorUserWorkspace lookup
        .mockResolvedValueOnce(mockImpersonatedUserWorkspace); // For impersonatedUserWorkspace lookup

      permissionsService.userHasWorkspaceSettingPermission.mockResolvedValue(
        true,
      );

      strategy = new JwtAuthStrategy(
        jwtWrapperService,
        workspaceRepository,
        applicationRepository,
        userRepository,
        userWorkspaceRepository,
        apiKeyRepository,
        permissionsService,
        globalWorkspaceOrmManager,
      );

      await expect(strategy.validate(payload as JwtPayload)).rejects.toThrow(
        new AuthException(
          'Token user workspace ID does not match impersonated user workspace ID',
          AuthExceptionCode.FORBIDDEN_EXCEPTION,
        ),
      );
    });

    it('should successfully validate workspace level impersonation with permission', async () => {
      const validUserId = randomUUID();
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
      mockWorkspace.allowImpersonation = false; // Server level disabled

      const mockUser = { id: validUserId, lastName: 'lastNameDefault' };

      const mockUserWorkspace = {
        id: validUserWorkspaceId,
        user: mockUser,
        workspace: mockWorkspace,
      };

      const mockImpersonatorUserWorkspace = {
        id: impersonatorUserWorkspaceId,
        user: { id: randomUUID(), canImpersonate: false },
        workspace: mockWorkspace, // Same workspace
      };

      workspaceRepository.findOneBy.mockResolvedValue(mockWorkspace);
      userRepository.findOne.mockResolvedValue(mockUser);
      userWorkspaceRepository.findOne
        .mockResolvedValueOnce(mockUserWorkspace) // For the main userWorkspace lookup
        .mockResolvedValueOnce(mockImpersonatorUserWorkspace) // For impersonatorUserWorkspace lookup
        .mockResolvedValueOnce(mockUserWorkspace); // For impersonatedUserWorkspace lookup (same as main)

      permissionsService.userHasWorkspaceSettingPermission.mockResolvedValue(
        true,
      );

      strategy = new JwtAuthStrategy(
        jwtWrapperService,
        workspaceRepository,
        applicationRepository,
        userRepository,
        userWorkspaceRepository,
        apiKeyRepository,
        permissionsService,
        globalWorkspaceOrmManager,
      );

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
      const validUserId = randomUUID();
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
      mockWorkspace.allowImpersonation = true; // Server level enabled

      const mockUser = { id: validUserId, lastName: 'lastNameDefault' };

      const mockImpersonatorUserWorkspace = {
        id: impersonatorUserWorkspaceId,
        user: { id: randomUUID(), canImpersonate: true }, // Server level permission
        workspace: { id: differentWorkspaceId }, // Different workspace
      };

      const mockImpersonatedUserWorkspace = {
        id: validUserWorkspaceId,
        user: mockUser,
        workspace: mockWorkspace,
      };

      workspaceRepository.findOneBy.mockResolvedValue(mockWorkspace);
      userRepository.findOne.mockResolvedValue(mockUser);
      userWorkspaceRepository.findOne
        .mockResolvedValueOnce(mockImpersonatorUserWorkspace) // For impersonatorUserWorkspace lookup
        .mockResolvedValueOnce(mockImpersonatedUserWorkspace) // For impersonatedUserWorkspace lookup
        .mockResolvedValueOnce(mockImpersonatedUserWorkspace); // For access token lookup

      strategy = new JwtAuthStrategy(
        jwtWrapperService,
        workspaceRepository,
        applicationRepository,
        userRepository,
        userWorkspaceRepository,
        apiKeyRepository,
        permissionsService,
        globalWorkspaceOrmManager,
      );

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
