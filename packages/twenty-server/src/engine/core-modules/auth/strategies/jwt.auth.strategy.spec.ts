import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { JwtPayload } from 'src/engine/core-modules/auth/types/auth-context.type';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

import { JwtAuthStrategy } from './jwt.auth.strategy';

describe('JwtAuthStrategy', () => {
  let strategy: JwtAuthStrategy;
  let workspaceRepository: any;
  let userWorkspaceRepository: any;
  let userRepository: any;
  let apiKeyRepository: any;
  let jwtWrapperService: any;

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

    jwtWrapperService = {
      extractJwtFromRequest: jest.fn(() => () => 'token'),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('API_KEY validation', () => {
    it('should throw AuthException if type is API_KEY and workspace is not found', async () => {
      const payload = {
        ...jwt,
        type: 'API_KEY',
      };

      workspaceRepository.findOneBy.mockResolvedValue(null);

      strategy = new JwtAuthStrategy(
        jwtWrapperService,
        workspaceRepository,
        userRepository,
        userWorkspaceRepository,
        apiKeyRepository,
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
        type: 'API_KEY',
      };

      const mockWorkspace = new Workspace();

      mockWorkspace.id = 'workspace-id';
      workspaceRepository.findOneBy.mockResolvedValue(mockWorkspace);

      apiKeyRepository.findOne.mockResolvedValue(null);

      strategy = new JwtAuthStrategy(
        jwtWrapperService,
        workspaceRepository,
        userRepository,
        userWorkspaceRepository,
        apiKeyRepository,
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
        type: 'API_KEY',
      };

      const mockWorkspace = new Workspace();

      mockWorkspace.id = 'workspace-id';
      workspaceRepository.findOneBy.mockResolvedValue(mockWorkspace);

      apiKeyRepository.findOne.mockResolvedValue({
        id: 'api-key-id',
        revokedAt: new Date(),
      });

      strategy = new JwtAuthStrategy(
        jwtWrapperService,
        workspaceRepository,
        userRepository,
        userWorkspaceRepository,
        apiKeyRepository,
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
        type: 'API_KEY',
      };

      const mockWorkspace = new Workspace();

      mockWorkspace.id = 'workspace-id';
      workspaceRepository.findOneBy.mockResolvedValue(mockWorkspace);

      apiKeyRepository.findOne.mockResolvedValue({
        id: 'api-key-id',
        revokedAt: null,
      });

      strategy = new JwtAuthStrategy(
        jwtWrapperService,
        workspaceRepository,
        userRepository,
        userWorkspaceRepository,
        apiKeyRepository,
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
      const payload = {
        sub: 'sub-default',
        type: 'ACCESS',
        userWorkspaceId: 'userWorkspaceId',
      };

      workspaceRepository.findOneBy.mockResolvedValue(new Workspace());

      userRepository.findOne.mockResolvedValue(null);

      strategy = new JwtAuthStrategy(
        jwtWrapperService,
        workspaceRepository,
        userRepository,
        userWorkspaceRepository,
        apiKeyRepository,
      );

      await expect(strategy.validate(payload as JwtPayload)).rejects.toThrow(
        new AuthException('UserWorkspace not found', expect.any(String)),
      );

      try {
        await strategy.validate(payload as JwtPayload);
      } catch (e) {
        expect(e.code).toBe(AuthExceptionCode.USER_WORKSPACE_NOT_FOUND);
      }
    });

    it('should throw AuthExceptionCode if type is ACCESS, no jti, and userWorkspace not found', async () => {
      const payload = {
        sub: 'sub-default',
        type: 'ACCESS',
        userWorkspaceId: 'userWorkspaceId',
      };

      workspaceRepository.findOneBy.mockResolvedValue(new Workspace());

      userRepository.findOne.mockResolvedValue({ lastName: 'lastNameDefault' });

      userWorkspaceRepository.findOne.mockResolvedValue(null);

      strategy = new JwtAuthStrategy(
        jwtWrapperService,
        workspaceRepository,
        userRepository,
        userWorkspaceRepository,
        apiKeyRepository,
      );

      await expect(strategy.validate(payload as JwtPayload)).rejects.toThrow(
        new AuthException('UserWorkspace not found', expect.any(String)),
      );

      try {
        await strategy.validate(payload as JwtPayload);
      } catch (e) {
        expect(e.code).toBe(AuthExceptionCode.USER_WORKSPACE_NOT_FOUND);
      }
    });

    it('should not throw if type is ACCESS, no jti, and user and userWorkspace exist', async () => {
      const payload = {
        sub: 'sub-default',
        type: 'ACCESS',
        userWorkspaceId: 'userWorkspaceId',
      };

      workspaceRepository.findOneBy.mockResolvedValue(new Workspace());

      userRepository.findOne.mockResolvedValue({ lastName: 'lastNameDefault' });

      userWorkspaceRepository.findOne.mockResolvedValue({
        id: 'userWorkspaceId',
      });

      strategy = new JwtAuthStrategy(
        jwtWrapperService,
        workspaceRepository,
        userRepository,
        userWorkspaceRepository,
        apiKeyRepository,
      );

      const user = await strategy.validate(payload as JwtPayload);

      expect(user.user?.lastName).toBe('lastNameDefault');
      expect(user.userWorkspaceId).toBe('userWorkspaceId');
    });
  });
});
