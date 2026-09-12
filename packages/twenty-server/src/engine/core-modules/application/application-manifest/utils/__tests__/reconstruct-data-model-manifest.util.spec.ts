import { FieldMetadataType, IndexType } from 'twenty-shared/types';

import { reconstructDataModelManifest } from 'src/engine/core-modules/application/application-manifest/utils/reconstruct-data-model-manifest.util';
import { ApplicationExportCoverageStatus } from 'src/engine/core-modules/application/enums/application-export-coverage-status.enum';
import { createEmptyAllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-all-flat-entity-maps.constant';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

const APP_ID = 'application-id';
const APP_UID = '11111111-1111-4111-8111-111111111111';
const PET_UID = '22222222-2222-4222-8222-222222222222';
const NAME_FIELD_UID = '33333333-3333-4333-8333-333333333333';
const ID_FIELD_UID = '44444444-4444-4444-8444-444444444444';
const AGE_FIELD_UID = '55555555-5555-4555-8555-555555555555';
const COMPANY_UID = '66666666-6666-4666-8666-666666666666';
const TAGLINE_FIELD_UID = '77777777-7777-4777-8777-777777777777';
const INDEX_UID = '88888888-8888-4888-8888-888888888888';
const RELATION_FIELD_UID = '99999999-9999-4999-8999-999999999999';

const buildMaps = ({
  objects = [],
  fields = [],
  indexes = [],
}: {
  objects?: FlatObjectMetadata[];
  fields?: FlatFieldMetadata[];
  indexes?: FlatIndexMetadata[];
}): AllFlatEntityMaps => {
  const maps = createEmptyAllFlatEntityMaps();

  for (const flatEntity of objects) {
    maps.flatObjectMetadataMaps = addFlatEntityToFlatEntityMapsOrThrow({
      flatEntity,
      flatEntityMaps: maps.flatObjectMetadataMaps,
    });
  }
  for (const flatEntity of fields) {
    maps.flatFieldMetadataMaps = addFlatEntityToFlatEntityMapsOrThrow({
      flatEntity,
      flatEntityMaps: maps.flatFieldMetadataMaps,
    });
  }
  for (const flatEntity of indexes) {
    maps.flatIndexMaps = addFlatEntityToFlatEntityMapsOrThrow({
      flatEntity,
      flatEntityMaps: maps.flatIndexMaps,
    });
  }

  return maps;
};

const petObject = getFlatObjectMetadataMock({
  universalIdentifier: PET_UID,
  applicationId: APP_ID,
  applicationUniversalIdentifier: APP_UID,
  nameSingular: 'pet',
  namePlural: 'pets',
  labelIdentifierFieldMetadataUniversalIdentifier: NAME_FIELD_UID,
});

const buildPetField = (
  overrides: Partial<FlatFieldMetadata> & { universalIdentifier: string },
) =>
  getFlatFieldMetadataMock({
    objectMetadataId: petObject.id,
    objectMetadataUniversalIdentifier: PET_UID,
    applicationId: APP_ID,
    applicationUniversalIdentifier: APP_UID,
    type: FieldMetadataType.TEXT,
    ...overrides,
  });

const nameField = buildPetField({
  universalIdentifier: NAME_FIELD_UID,
  name: 'name',
  isSystemSideEffect: true,
  isSystem: false,
});
const idField = buildPetField({
  universalIdentifier: ID_FIELD_UID,
  name: 'id',
  type: FieldMetadataType.UUID,
  isSystemSideEffect: true,
  isSystem: true,
});
const ageField = buildPetField({
  universalIdentifier: AGE_FIELD_UID,
  name: 'age',
  type: FieldMetadataType.NUMBER,
});
const taglineField = getFlatFieldMetadataMock({
  universalIdentifier: TAGLINE_FIELD_UID,
  objectMetadataId: 'company-id',
  objectMetadataUniversalIdentifier: COMPANY_UID,
  applicationId: APP_ID,
  applicationUniversalIdentifier: APP_UID,
  type: FieldMetadataType.TEXT,
  name: 'tagline',
});

const buildIndex = (overrides: Partial<FlatIndexMetadata>): FlatIndexMetadata =>
  ({
    id: 'index-id',
    universalIdentifier: INDEX_UID,
    applicationId: APP_ID,
    applicationUniversalIdentifier: APP_UID,
    workspaceId: 'workspace-id',
    name: 'IDX_pet_age',
    objectMetadataId: petObject.id,
    objectMetadataUniversalIdentifier: PET_UID,
    indexType: IndexType.BTREE,
    indexWhereClause: null,
    isCustom: false,
    isUnique: false,
    isSystemSideEffect: false,
    createdAt: '2026-09-03T10:00:00.000Z',
    updatedAt: '2026-09-03T10:00:00.000Z',
    flatIndexFieldMetadatas: [],
    universalFlatIndexFieldMetadatas: [
      {
        order: 0,
        subFieldName: null,
        fieldMetadataUniversalIdentifier: AGE_FIELD_UID,
        indexMetadataUniversalIdentifier: INDEX_UID,
        createdAt: '2026-09-03T10:00:00.000Z',
        updatedAt: '2026-09-03T10:00:00.000Z',
      },
    ],
    ...overrides,
  }) as FlatIndexMetadata;

const statusOf = (
  coverage: ReturnType<typeof reconstructDataModelManifest>['coverage'],
  universalIdentifier: string,
) =>
  coverage.find((entry) => entry.universalIdentifier === universalIdentifier);

describe('reconstructDataModelManifest', () => {
  it('should inline the object fields, keep the label identifier and drop engine-derived fields', () => {
    const { objects, fields, coverage } = reconstructDataModelManifest({
      applicationAllFlatEntityMaps: buildMaps({
        objects: [petObject],
        fields: [nameField, idField, ageField],
      }),
    });

    expect(objects).toHaveLength(1);
    expect(objects[0].fields.map(({ name }) => name)).toEqual(['age', 'name']);
    expect(fields).toEqual([]);
    expect(statusOf(coverage, ID_FIELD_UID)?.status).toBe(
      ApplicationExportCoverageStatus.ENGINE_DERIVED,
    );
    expect(statusOf(coverage, NAME_FIELD_UID)?.status).toBe(
      ApplicationExportCoverageStatus.EXPORTED,
    );
  });

  it('should export a field of a foreign object as a standalone field', () => {
    const { objects, fields } = reconstructDataModelManifest({
      applicationAllFlatEntityMaps: buildMaps({ fields: [taglineField] }),
    });

    expect(objects).toEqual([]);
    expect(fields).toMatchObject([
      { name: 'tagline', objectUniversalIdentifier: COMPANY_UID },
    ]);
  });

  it('should mark an object without label identifier and its fields unsupported', () => {
    const { objects, fields, coverage } = reconstructDataModelManifest({
      applicationAllFlatEntityMaps: buildMaps({
        objects: [
          getFlatObjectMetadataMock({
            ...petObject,
            labelIdentifierFieldMetadataUniversalIdentifier: null,
          }),
        ],
        fields: [ageField],
      }),
    });

    expect(objects).toEqual([]);
    expect(fields).toEqual([]);
    expect(statusOf(coverage, PET_UID)?.status).toBe(
      ApplicationExportCoverageStatus.UNSUPPORTED,
    );
    expect(statusOf(coverage, AGE_FIELD_UID)?.status).toBe(
      ApplicationExportCoverageStatus.UNSUPPORTED,
    );
  });

  it('should export an authored index and refuse partial, engine-derived and foreign indexes', () => {
    const maps = buildMaps({
      objects: [petObject],
      fields: [nameField, ageField],
      indexes: [
        buildIndex({}),
        buildIndex({
          universalIdentifier: 'partial-index',
          indexWhereClause: '"age" > 0',
        }),
        buildIndex({
          universalIdentifier: 'engine-index',
          isSystemSideEffect: true,
        }),
        buildIndex({
          universalIdentifier: 'foreign-index',
          objectMetadataUniversalIdentifier: COMPANY_UID,
        }),
      ],
    });

    const { indexes, coverage } = reconstructDataModelManifest({
      applicationAllFlatEntityMaps: maps,
    });

    expect(
      indexes.map(({ universalIdentifier }) => universalIdentifier),
    ).toEqual([INDEX_UID]);
    expect(statusOf(coverage, 'partial-index')).toMatchObject({
      status: ApplicationExportCoverageStatus.UNSUPPORTED,
      reason: 'partial index',
    });
    expect(statusOf(coverage, 'engine-index')?.status).toBe(
      ApplicationExportCoverageStatus.ENGINE_DERIVED,
    );
    expect(statusOf(coverage, 'foreign-index')?.status).toBe(
      ApplicationExportCoverageStatus.UNSUPPORTED,
    );
  });
  it('should tell an index on an unsupported object apart from an index outside the application', () => {
    const { coverage } = reconstructDataModelManifest({
      applicationAllFlatEntityMaps: buildMaps({
        objects: [
          getFlatObjectMetadataMock({
            ...petObject,
            labelIdentifierFieldMetadataUniversalIdentifier: null,
          }),
        ],
        fields: [ageField],
        indexes: [
          buildIndex({}),
          buildIndex({
            universalIdentifier: 'foreign-index',
            objectMetadataUniversalIdentifier: COMPANY_UID,
          }),
        ],
      }),
    });

    expect(statusOf(coverage, INDEX_UID)).toMatchObject({
      status: ApplicationExportCoverageStatus.UNSUPPORTED,
      reason: 'index on an unsupported object',
    });
    expect(statusOf(coverage, 'foreign-index')).toMatchObject({
      status: ApplicationExportCoverageStatus.UNSUPPORTED,
      reason: 'index on an object outside the application',
    });
  });

  it('should mark a relation field without target unsupported instead of failing the export', () => {
    const brokenRelationField = buildPetField({
      universalIdentifier: RELATION_FIELD_UID,
      name: 'owner',
      type: FieldMetadataType.RELATION,
      relationTargetFieldMetadataUniversalIdentifier: null,
      relationTargetObjectMetadataUniversalIdentifier: null,
      universalSettings: null,
    });

    const { objects, coverage } = reconstructDataModelManifest({
      applicationAllFlatEntityMaps: buildMaps({
        objects: [petObject],
        fields: [nameField, ageField, brokenRelationField],
      }),
    });

    expect(objects[0].fields.map(({ name }) => name)).toEqual(['age', 'name']);
    expect(statusOf(coverage, RELATION_FIELD_UID)).toMatchObject({
      status: ApplicationExportCoverageStatus.UNSUPPORTED,
      reason: 'relation field without target or settings',
    });
  });

  it('should disclose deactivation and workspace overrides on exported rows', () => {
    const { coverage } = reconstructDataModelManifest({
      applicationAllFlatEntityMaps: buildMaps({
        objects: [getFlatObjectMetadataMock({ ...petObject, isActive: false })],
        fields: [
          nameField,
          buildPetField({
            ...ageField,
            overrides: { label: 'Age in years' },
          }),
        ],
      }),
    });

    expect(statusOf(coverage, PET_UID)).toMatchObject({
      status: ApplicationExportCoverageStatus.EXPORTED,
      reason: 'deactivated in this workspace, exported active',
    });
    expect(statusOf(coverage, AGE_FIELD_UID)).toMatchObject({
      status: ApplicationExportCoverageStatus.EXPORTED,
      reason: 'workspace overrides not exported',
    });
    expect(statusOf(coverage, NAME_FIELD_UID)).not.toHaveProperty('reason');
  });
});
