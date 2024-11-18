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
  let userRepository: any;
  let dataSourceService: any;
  let typeORMService: any;
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
      {} as any,
      {} as any,
      typeORMService,
      dataSourceService,
      workspaceRepository,
      {} as any,
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

    dataSourceService = {
      getLastDataSourceMetadataFromWorkspaceIdOrFail: jest.fn(async () => ({})),
    };

    typeORMService = {
      connectToDataSource: jest.fn(async () => {}),
    };

    strategy = new JwtAuthStrategy(
      {} as any,
      {} as any,
      typeORMService,
      dataSourceService,
      workspaceRepository,
      {} as any,
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

    const mockDataSource = {
      query: jest
        .fn()
        .mockResolvedValue([{ id: 'api-key-id', revokedAt: null }]),
    };

    jest
      .spyOn(typeORMService, 'connectToDataSource')
      .mockResolvedValue(mockDataSource as any);

    strategy = new JwtAuthStrategy(
      {} as any,
      {} as any,
      typeORMService,
      dataSourceService,
      workspaceRepository,
      {} as any,
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
      {} as any,
      {} as any,
      typeORMService,
      dataSourceService,
      workspaceRepository,
      userRepository,
    );

    await expect(strategy.validate(payload as JwtPayload)).rejects.toThrow(
      new AuthException('User not found', expect.any(String)),
    );
    try {
      await strategy.validate(payload as JwtPayload);
    } catch (e) {
      expect(e.code).toBe(AuthExceptionCode.USER_NOT_FOUND);
    }
  });

  it('should be truthy if type is ACCESS, no jti, and user exist', async () => {
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

    strategy = new JwtAuthStrategy(
      {} as any,
      {} as any,
      typeORMService,
      dataSourceService,
      workspaceRepository,
      userRepository,
    );

    const user = await strategy.validate(payload as JwtPayload);

    expect(user.user?.lastName).toBe('lastNameDefault');
  });
});
