import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { AdminPanelService } from 'src/engine/core-modules/admin-panel/admin-panel.service';
import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { LoginTokenService } from 'src/engine/core-modules/auth/token/services/login-token.service';
import { DomainManagerService } from 'src/engine/core-modules/domain-manager/services/domain-manager.service';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlag } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { User } from 'src/engine/core-modules/user/user.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

const UserFindOneMock = jest.fn();
const WorkspaceFindOneMock = jest.fn();
const FeatureFlagUpdateMock = jest.fn();
const FeatureFlagSaveMock = jest.fn();
const LoginTokenServiceGenerateLoginTokenMock = jest.fn();
const EnvironmentServiceGetAllMock = jest.fn();

jest.mock(
  'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum',
  () => {
    return {
      FeatureFlagKey: {
        IsFlagEnabled: 'IS_FLAG_ENABLED',
      },
    };
  },
);

jest.mock(
  '../../environment/constants/environment-variables-group-metadata',
  () => ({
    ENVIRONMENT_VARIABLES_GROUP_METADATA: {
      SERVER_CONFIG: {
        position: 100,
        description: 'Server config description',
        isHiddenOnLoad: false,
      },
      RATE_LIMITING: {
        position: 200,
        description: 'Rate limiting description',
        isHiddenOnLoad: false,
      },
      OTHER: {
        position: 300,
        description: 'Other description',
        isHiddenOnLoad: true,
      },
    },
  }),
);

describe('AdminPanelService', () => {
  let service: AdminPanelService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminPanelService,
        {
          provide: getRepositoryToken(Workspace, 'core'),
          useValue: {
            findOne: WorkspaceFindOneMock,
          },
        },
        {
          provide: getRepositoryToken(User, 'core'),
          useValue: {
            findOne: UserFindOneMock,
          },
        },
        {
          provide: getRepositoryToken(FeatureFlag, 'core'),
          useValue: {
            update: FeatureFlagUpdateMock,
            save: FeatureFlagSaveMock,
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
          provide: EnvironmentService,
          useValue: {
            getAll: EnvironmentServiceGetAllMock,
          },
        },
      ],
    }).compile();

    service = module.get<AdminPanelService>(AdminPanelService);
  });

  it('should be defined', async () => {
    expect(service).toBeDefined();
  });

  it('should update an existing feature flag if it exists', async () => {
    const workspaceId = 'workspace-id';
    const featureFlag = 'IsFlagEnabled' as FeatureFlagKey;
    const value = true;
    const existingFlag = {
      id: 'flag-id',
      key: 'IS_FLAG_ENABLED',
      value: false,
    };

    WorkspaceFindOneMock.mockReturnValueOnce({
      id: workspaceId,
      featureFlags: [existingFlag],
    });

    await service.updateWorkspaceFeatureFlags(workspaceId, featureFlag, value);

    expect(FeatureFlagUpdateMock).toHaveBeenCalledWith(existingFlag.id, {
      value,
    });
    expect(FeatureFlagSaveMock).not.toHaveBeenCalled();
  });

  it('should create a new feature flag if it does not exist', async () => {
    const workspaceId = 'workspace-id';
    const featureFlag = 'IsFlagEnabled' as FeatureFlagKey;
    const value = true;

    WorkspaceFindOneMock.mockReturnValueOnce({
      id: workspaceId,
      featureFlags: [],
    });

    await service.updateWorkspaceFeatureFlags(workspaceId, featureFlag, value);

    expect(FeatureFlagSaveMock).toHaveBeenCalledWith({
      key: 'IS_FLAG_ENABLED',
      value,
      workspaceId,
    });
    expect(FeatureFlagUpdateMock).not.toHaveBeenCalled();
  });

  it('should throw an exception if the workspace is not found', async () => {
    const workspaceId = 'non-existent-workspace';
    const featureFlag = 'IsFlagEnabled' as FeatureFlagKey;
    const value = true;

    WorkspaceFindOneMock.mockReturnValueOnce(null);

    await expect(
      service.updateWorkspaceFeatureFlags(workspaceId, featureFlag, value),
    ).rejects.toThrowError(
      new AuthException('Workspace not found', AuthExceptionCode.INVALID_INPUT),
    );
  });

  it('should throw an exception if the flag is not found', async () => {
    const workspaceId = 'non-existent-workspace';
    const featureFlag = 'IsUnknownFlagEnabled' as FeatureFlagKey;
    const value = true;

    WorkspaceFindOneMock.mockReturnValueOnce(null);

    await expect(
      service.updateWorkspaceFeatureFlags(workspaceId, featureFlag, value),
    ).rejects.toThrowError(
      new AuthException(
        'Invalid feature flag key',
        AuthExceptionCode.INVALID_INPUT,
      ),
    );
  });

  it('should impersonate a user and return workspace and loginToken on success', async () => {
    const mockUser = {
      id: 'user-id',
      email: 'user@example.com',
      workspaces: [
        {
          workspace: {
            id: 'workspace-id',
            allowImpersonation: true,
            subdomain: 'example-subdomain',
          },
        },
      ],
    };

    UserFindOneMock.mockReturnValueOnce(mockUser);
    LoginTokenServiceGenerateLoginTokenMock.mockReturnValueOnce({
      token: 'mock-login-token',
      expiresAt: new Date(),
    });

    const result = await service.impersonate('user-id', 'workspace-id');

    expect(UserFindOneMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          id: 'user-id',
          workspaces: {
            workspaceId: 'workspace-id',
            workspace: { allowImpersonation: true },
          },
        }),
        relations: ['workspaces', 'workspaces.workspace'],
      }),
    );

    expect(LoginTokenServiceGenerateLoginTokenMock).toHaveBeenCalledWith(
      'user@example.com',
      'workspace-id',
    );

    expect(result).toEqual(
      expect.objectContaining({
        workspace: {
          id: 'workspace-id',
          workspaceUrls: {
            customUrl: undefined,
            subdomainUrl: 'https://twenty.twenty.com',
          },
        },
        loginToken: expect.objectContaining({
          token: 'mock-login-token',
          expiresAt: expect.any(Date),
        }),
      }),
    );
  });

  it('should throw an error when user is not found', async () => {
    UserFindOneMock.mockReturnValueOnce(null);

    await expect(
      service.impersonate('invalid-user-id', 'workspace-id'),
    ).rejects.toThrow(
      new AuthException(
        'User not found or impersonation not enable on workspace',
        AuthExceptionCode.INVALID_INPUT,
      ),
    );

    expect(UserFindOneMock).toHaveBeenCalled();
  });

  describe('getEnvironmentVariablesGrouped', () => {
    it('should correctly group and sort environment variables', () => {
      EnvironmentServiceGetAllMock.mockReturnValue({
        SERVER_URL: {
          value: 'http://localhost',
          metadata: {
            group: 'SERVER_CONFIG',
            description: 'Server URL',
          },
        },
        RATE_LIMIT_TTL: {
          value: '60',
          metadata: {
            group: 'RATE_LIMITING',
            description: 'Rate limit TTL',
          },
        },
        API_KEY: {
          value: 'secret-key',
          metadata: {
            group: 'SERVER_CONFIG',
            description: 'API Key',
            sensitive: true,
          },
        },
        OTHER_VAR: {
          value: 'other',
          metadata: {
            group: 'OTHER',
            description: 'Other var',
          },
        },
      });

      const result = service.getEnvironmentVariablesGrouped();

      expect(result).toEqual({
        groups: [
          {
            name: 'SERVER_CONFIG',
            description: 'Server config description',
            isHiddenOnLoad: false,
            variables: [
              {
                name: 'API_KEY',
                value: 'secret-key',
                description: 'API Key',
                sensitive: true,
              },
              {
                name: 'SERVER_URL',
                value: 'http://localhost',
                description: 'Server URL',
                sensitive: false,
              },
            ],
          },
          {
            name: 'RATE_LIMITING',
            description: 'Rate limiting description',
            isHiddenOnLoad: false,
            variables: [
              {
                name: 'RATE_LIMIT_TTL',
                value: '60',
                description: 'Rate limit TTL',
                sensitive: false,
              },
            ],
          },
          {
            name: 'OTHER',
            description: 'Other description',
            isHiddenOnLoad: true,
            variables: [
              {
                name: 'OTHER_VAR',
                value: 'other',
                description: 'Other var',
                sensitive: false,
              },
            ],
          },
        ],
      });

      expect(result.groups[0].name).toBe('SERVER_CONFIG');
      expect(result.groups[1].name).toBe('RATE_LIMITING');
      expect(result.groups[2].name).toBe('OTHER');
    });

    it('should handle empty environment variables', () => {
      EnvironmentServiceGetAllMock.mockReturnValue({});

      const result = service.getEnvironmentVariablesGrouped();

      expect(result).toEqual({
        groups: [],
      });
    });

    it('should handle variables with undefined metadata fields', () => {
      EnvironmentServiceGetAllMock.mockReturnValue({
        TEST_VAR: {
          value: 'test',
          metadata: {
            group: 'SERVER_CONFIG',
          },
        },
      });

      const result = service.getEnvironmentVariablesGrouped();

      expect(result.groups[0].variables[0]).toEqual({
        name: 'TEST_VAR',
        value: 'test',
        description: undefined,
        sensitive: false,
      });
    });
  });
});
