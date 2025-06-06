import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { JwtPayload } from 'src/engine/core-modules/auth/types/auth-context.type';
import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

import { JwtAuthStrategy } from './jwt.auth.strategy';

describe('JwtAuthStrategy', () => {
  let strategy: JwtAuthStrategy;

  let workspaceRepository: any;
  let userWorkspaceRepository: any;
  let userRepository: any;
  let twentyORMGlobalManager: any;
  const jwt = {
    sub: 'sub-default',
    jti: 'jti-default',
  };

  workspaceRepository = {
    findOneBy: jest.fn(async () => new Workspace()),
  };

  userRepository = {
    findOne: jest.fn(async () => null),
  };

  userWorkspaceRepository = {
    findOne: jest.fn(async () => new UserWorkspace()),
  };

  const jwtWrapperService: any = {
    extractJwtFromRequest: jest.fn(() => () => 'token'),
  };

  twentyORMGlobalManager = {
    getRepositoryForWorkspace: jest.fn(async () => ({
      findOne: jest.fn(async () => ({ id: 'api-key-id', revokedAt: null })),
    })),
  };

  // first we test the API_KEY case
  it('should throw AuthException if type is API_KEY and workspace is not found', async () => {
    const payload = {
      ...jwt,
      type: 'API_KEY',
    };

    workspaceRepository = {
      findOneBy: jest.fn(async () => null),
    };

    strategy = new JwtAuthStrategy(
      jwtWrapperService,
      twentyORMGlobalManager,
      workspaceRepository,
      {} as any,
      userWorkspaceRepository,
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

    workspaceRepository = {
      findOneBy: jest.fn(async () => new Workspace()),
    };

    twentyORMGlobalManager = {
      getRepositoryForWorkspace: jest.fn(async () => ({
        findOne: jest.fn(async () => null),
      })),
    };

    strategy = new JwtAuthStrategy(
      jwtWrapperService,
      twentyORMGlobalManager,
      workspaceRepository,
      {} as any,
      userWorkspaceRepository,
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

    workspaceRepository = {
      findOneBy: jest.fn(async () => new Workspace()),
    };

    twentyORMGlobalManager = {
      getRepositoryForWorkspace: jest.fn(async () => ({
        findOne: jest.fn(async () => ({ id: 'api-key-id', revokedAt: null })),
      })),
    };

    strategy = new JwtAuthStrategy(
      jwtWrapperService,
      twentyORMGlobalManager,
      workspaceRepository,
      {} as any,
      userWorkspaceRepository,
    );

    const result = await strategy.validate(payload as JwtPayload);

    expect(result).toBeTruthy();
    expect(result.apiKey?.id).toBe('api-key-id');
  });

  // second we test the ACCESS cases
  it('should throw AuthExceptionCode if type is ACCESS, no jti, and user not found', async () => {
    const payload = {
      sub: 'sub-default',
      type: 'ACCESS',
    };

    workspaceRepository = {
      findOneBy: jest.fn(async () => new Workspace()),
    };

    userRepository = {
      findOne: jest.fn(async () => null),
    };

    strategy = new JwtAuthStrategy(
      jwtWrapperService,
      twentyORMGlobalManager,
      workspaceRepository,
      userRepository,
      userWorkspaceRepository,
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
    };

    workspaceRepository = {
      findOneBy: jest.fn(async () => new Workspace()),
    };

    userRepository = {
      findOne: jest.fn(async () => ({ lastName: 'lastNameDefault' })),
    };

    userWorkspaceRepository = {
      findOne: jest.fn(async () => null),
    };

    strategy = new JwtAuthStrategy(
      jwtWrapperService,
      twentyORMGlobalManager,
      workspaceRepository,
      userRepository,
      userWorkspaceRepository,
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

    workspaceRepository = {
      findOneBy: jest.fn(async () => new Workspace()),
    };

    userRepository = {
      findOne: jest.fn(async () => ({ lastName: 'lastNameDefault' })),
    };

    userWorkspaceRepository = {
      findOne: jest.fn(async () => ({
        id: 'userWorkspaceId',
      })),
    };

    strategy = new JwtAuthStrategy(
      jwtWrapperService,
      twentyORMGlobalManager,
      workspaceRepository,
      userRepository,
      userWorkspaceRepository,
    );

    const user = await strategy.validate(payload as JwtPayload);

    expect(user.user?.lastName).toBe('lastNameDefault');
    expect(user.userWorkspaceId).toBe('userWorkspaceId');
  });
});
