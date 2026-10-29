import { Test, type TestingModule } from '@nestjs/testing';

import { ApplicationVariableEntity } from 'src/engine/core-modules/application/application-variable/application-variable.entity';
import { ApplicationVariableEntityService } from 'src/engine/core-modules/application/application-variable/application-variable.service';
import { SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';
import { type FlatApplicationVariableMaps } from 'src/engine/metadata-modules/flat-application-variable/types/flat-application-variable-maps.type';
import { type FlatApplicationVariable } from 'src/engine/metadata-modules/flat-application-variable/types/flat-application-variable.type';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { getWorkspaceScopedRepositoryToken } from 'src/engine/twenty-orm/workspace-scoped-repository/get-workspace-scoped-repository-token.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const WORKSPACE_ID = 'workspace-id';
const APPLICATION_ID = 'application-id';

const buildFlatApplicationVariable = ({
  id,
  key,
  value,
  isSecret = false,
}: {
  id: string;
  key: string;
  value: string;
  isSecret?: boolean;
}) =>
  ({
    id,
    universalIdentifier: `${id}-universal-identifier`,
    workspaceId: WORKSPACE_ID,
    applicationId: APPLICATION_ID,
    key,
    value,
    isSecret,
    scope: 'WORKSPACE',
  }) as FlatApplicationVariable;

const FLAT_APPLICATION_VARIABLE_MAPS = [
  buildFlatApplicationVariable({
    id: 'api-base-url-id',
    key: 'API_BASE_URL',
    value: 'enc:url',
  }),
  buildFlatApplicationVariable({
    id: 'api-token-id',
    key: 'API_TOKEN',
    value: 'enc:token',
    isSecret: true,
  }),
  buildFlatApplicationVariable({
    id: 'legacy-setting-id',
    key: 'TWENTY_LEGACY_SETTING',
    value: 'enc:legacy',
  }),
].reduce<FlatApplicationVariableMaps>(
  (flatEntityMaps, flatEntity) =>
    addFlatEntityToFlatEntityMapsOrThrow({ flatEntity, flatEntityMaps }),
  createEmptyFlatEntityMaps(),
);

describe('ApplicationVariableEntityService', () => {
  let service: ApplicationVariableEntityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationVariableEntityService,
        {
          provide: getWorkspaceScopedRepositoryToken(ApplicationVariableEntity),
          useValue: {},
        },
        { provide: WorkspaceCacheService, useValue: {} },
        {
          provide: SecretEncryptionService,
          useValue: {
            decryptVersionedOrThrow: (value: string) => `plaintext of ${value}`,
          },
        },
      ],
    }).compile();

    service = module.get(ApplicationVariableEntityService);
  });

  it('should give logic functions the workspace variables, without reserved names', async () => {
    const envVariables = await service.getServerEnvVariables({
      workspaceId: WORKSPACE_ID,
      applicationId: APPLICATION_ID,
      flatApplicationVariableMaps: FLAT_APPLICATION_VARIABLE_MAPS,
    });

    expect(envVariables).toEqual({
      API_BASE_URL: 'plaintext of enc:url',
      API_TOKEN: 'plaintext of enc:token',
    });
  });

  it('should give front components the non-secret workspace variables, without reserved names', async () => {
    const envVariables = await service.getPublicEnvVariables({
      workspaceId: WORKSPACE_ID,
      applicationId: APPLICATION_ID,
      flatApplicationVariableMaps: FLAT_APPLICATION_VARIABLE_MAPS,
    });

    expect(envVariables).toEqual({ API_BASE_URL: 'plaintext of enc:url' });
  });
});
