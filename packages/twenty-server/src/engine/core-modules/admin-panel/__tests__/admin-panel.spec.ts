import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { AdminPanelService } from 'src/engine/core-modules/admin-panel/admin-panel.service';
import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { LoginTokenService } from 'src/engine/core-modules/auth/token/services/login-token.service';
import { EnvironmentVariablesGroup } from 'src/engine/core-modules/environment/enums/environment-variables-group.enum';
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
  'src/engine/core-modules/environment/constants/environment-variables-hidden-groups',
  () => ({
    ENVIRONMENT_VARIABLES_HIDDEN_GROUPS: new Set(['HIDDEN_GROUP']),
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
          subdomain: 'example-subdomain',
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
    it('should correctly group environment variables', () => {
      EnvironmentServiceGetAllMock.mockReturnValue({
        VAR_1: {
          value: 'value1',
          metadata: {
            group: 'GROUP_1',
            description: 'Description 1',
          },
        },
        VAR_2: {
          value: 'value2',
          metadata: {
            group: 'GROUP_1',
            subGroup: 'SUBGROUP_1',
            description: 'Description 2',
            sensitive: true,
          },
        },
        VAR_3: {
          value: 'value3',
          metadata: {
            group: 'GROUP_2',
            description: 'Description 3',
          },
        },
      });

      const result = service.getEnvironmentVariablesGrouped();

      expect(result).toEqual({
        groups: expect.arrayContaining([
          expect.objectContaining({
            groupName: 'GROUP_1',
            variables: [
              {
                name: 'VAR_1',
                value: 'value1',
                description: 'Description 1',
                sensitive: false,
              },
            ],
            subgroups: [
              {
                subgroupName: 'SUBGROUP_1',
                variables: [
                  {
                    name: 'VAR_2',
                    value: 'value2',
                    description: 'Description 2',
                    sensitive: true,
                  },
                ],
              },
            ],
          }),
          expect.objectContaining({
            groupName: 'GROUP_2',
            variables: [
              {
                name: 'VAR_3',
                value: 'value3',
                description: 'Description 3',
                sensitive: false,
              },
            ],
            subgroups: [],
          }),
        ]),
      });
    });

    it('should sort groups by position and variables alphabetically', () => {
      EnvironmentServiceGetAllMock.mockReturnValue({
        Z_VAR: {
          value: 'valueZ',
          metadata: {
            group: 'GROUP_1',
            description: 'Description Z',
          },
        },
        A_VAR: {
          value: 'valueA',
          metadata: {
            group: 'GROUP_1',
            description: 'Description A',
          },
        },
      });

      const result = service.getEnvironmentVariablesGrouped();

      const group = result.groups.find(
        (g) => g.groupName === ('GROUP_1' as EnvironmentVariablesGroup),
      );

      expect(group?.variables[0].name).toBe('A_VAR');
      expect(group?.variables[1].name).toBe('Z_VAR');
    });

    it('should handle empty environment variables', () => {
      EnvironmentServiceGetAllMock.mockReturnValue({});

      const result = service.getEnvironmentVariablesGrouped();

      expect(result).toEqual({
        groups: [],
      });
    });

    it('should exclude hidden groups from the output', () => {
      EnvironmentServiceGetAllMock.mockReturnValue({
        VAR_1: {
          value: 'value1',
          metadata: {
            group: 'HIDDEN_GROUP',
            description: 'Description 1',
          },
        },
        VAR_2: {
          value: 'value2',
          metadata: {
            group: 'VISIBLE_GROUP',
            description: 'Description 2',
          },
        },
      });

      const result = service.getEnvironmentVariablesGrouped();

      expect(result.groups).toHaveLength(1);
      expect(result.groups[0].groupName).toBe('VISIBLE_GROUP');
      expect(result.groups).not.toContainEqual(
        expect.objectContaining({
          groupName: 'HIDDEN_GROUP',
        }),
      );
    });
  });
});
