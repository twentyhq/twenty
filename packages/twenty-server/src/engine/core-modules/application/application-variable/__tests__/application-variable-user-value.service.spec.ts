import { Test, type TestingModule } from '@nestjs/testing';

import { ApplicationVariableUserValueEntity } from 'src/engine/core-modules/application/application-variable/application-variable-user-value.entity';
import { ApplicationVariableUserValueService } from 'src/engine/core-modules/application/application-variable/application-variable-user-value.service';
import { ApplicationVariableEntityService } from 'src/engine/core-modules/application/application-variable/application-variable.service';
import { SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { type FlatApplicationVariable } from 'src/engine/metadata-modules/flat-application-variable/types/flat-application-variable.type';
import { getWorkspaceScopedRepositoryToken } from 'src/engine/twenty-orm/workspace-scoped-repository/get-workspace-scoped-repository-token.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const WORKSPACE_ID = 'workspace-id';
const APPLICATION_ID = 'application-id';
const USER_WORKSPACE_ID = 'user-workspace-id';

const buildFlatApplicationVariable = (
  overrides: Pick<FlatApplicationVariable, 'id' | 'key' | 'scope'> &
    Partial<FlatApplicationVariable>,
) =>
  ({
    workspaceId: WORKSPACE_ID,
    applicationId: APPLICATION_ID,
    isSecret: false,
    defaultValue: null,
    value: null,
    ...overrides,
  }) as FlatApplicationVariable;

const FLAT_APPLICATION_VARIABLES = [
  buildFlatApplicationVariable({
    id: 'workspace-variable-id',
    key: 'API_BASE_URL',
    scope: 'WORKSPACE',
  }),
  buildFlatApplicationVariable({
    id: 'record-my-meetings-id',
    key: 'RECORD_MY_MEETINGS',
    scope: 'USER',
    defaultValue: 'off',
  }),
  buildFlatApplicationVariable({
    id: 'personal-api-key-id',
    key: 'PERSONAL_API_KEY',
    scope: 'USER',
    isSecret: true,
  }),
  buildFlatApplicationVariable({
    id: 'language-id',
    key: 'LANGUAGE',
    scope: 'USER',
    defaultValue: 'en',
  }),
];

describe('ApplicationVariableUserValueService', () => {
  let service: ApplicationVariableUserValueService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationVariableUserValueService,
        {
          provide: getWorkspaceScopedRepositoryToken(
            ApplicationVariableUserValueEntity,
          ),
          useValue: {
            find: jest.fn().mockResolvedValue([
              {
                applicationVariableId: 'record-my-meetings-id',
                value: 'enc:on',
              },
              {
                applicationVariableId: 'personal-api-key-id',
                value: 'enc:key',
              },
            ]),
          },
        },
        {
          provide: getWorkspaceScopedRepositoryToken(UserWorkspaceEntity),
          useValue: {},
        },
        {
          provide: ApplicationVariableEntityService,
          useValue: {
            findFlatApplicationVariables: jest
              .fn()
              .mockResolvedValue(FLAT_APPLICATION_VARIABLES),
            getDisplayValue: ({
              value,
              isSecret,
            }: {
              value: string;
              isSecret: boolean;
            }) => (isSecret ? '********' : `plaintext of ${value}`),
          },
        },
        { provide: WorkspaceCacheService, useValue: {} },
        { provide: SecretEncryptionService, useValue: {} },
      ],
    }).compile();

    service = module.get(ApplicationVariableUserValueService);
  });

  describe('getServerEnvVariables', () => {
    it('should give a run the values of the member behind it, secrets unmasked, and the defaults they did not set', async () => {
      const envVariables = await service.getServerEnvVariables({
        workspaceId: WORKSPACE_ID,
        applicationId: APPLICATION_ID,
        userWorkspaceId: USER_WORKSPACE_ID,
      });

      expect(envVariables).toEqual({
        RECORD_MY_MEETINGS: 'plaintext of enc:on',
        PERSONAL_API_KEY: 'plaintext of enc:key',
        LANGUAGE: 'en',
      });
    });

    it('should give a run with nobody behind it the defaults', async () => {
      const envVariables = await service.getServerEnvVariables({
        workspaceId: WORKSPACE_ID,
        applicationId: APPLICATION_ID,
        userWorkspaceId: undefined,
      });

      expect(envVariables).toEqual({
        RECORD_MY_MEETINGS: 'off',
        PERSONAL_API_KEY: '',
        LANGUAGE: 'en',
      });
    });
  });
});
