import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import { INDEX_LEVEL_UNIQUE_STANDARD_FIELD_UNIVERSAL_IDENTIFIERS } from 'src/database/commands/upgrade-version-command/2-58/constants/index-level-unique-standard-field-universal-identifiers.constant';
import { buildUniqueFieldIndexReplacements } from 'src/database/commands/upgrade-version-command/2-58/utils/build-unique-field-index-replacements.util';
import { type FlatApplicationCacheMaps } from 'src/engine/core-modules/application/types/flat-application-cache-maps.type';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { getFlatIndexMetadataMock } from 'src/engine/metadata-modules/flat-index-metadata/__mocks__/get-flat-index-metadata.mock';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';

const NOW = '2026-11-10T00:00:00.000Z';
const APPLICATION_ID = 'custom-application-id';
const APPLICATION_UNIVERSAL_IDENTIFIER = '6f0c2a5e-1b7d-4c3a-9e8f-2d4b6a8c0e1f';
const OBJECT_METADATA_ID = 'a3b1c2d4-5e6f-4a7b-8c9d-0e1f2a3b4c5d';

const buildFlatEntityMaps = <TFlatEntity extends SyncableFlatEntity>(
  flatEntities: TFlatEntity[],
): FlatEntityMaps<TFlatEntity> => ({
  byUniversalIdentifier: Object.fromEntries(
    flatEntities.map((flatEntity) => [
      flatEntity.universalIdentifier,
      flatEntity,
    ]),
  ),
  universalIdentifierById: Object.fromEntries(
    flatEntities.map((flatEntity) => [
      flatEntity.id,
      flatEntity.universalIdentifier,
    ]),
  ),
  universalIdentifiersByApplicationId: {},
});

const flatApplicationMaps: FlatApplicationCacheMaps = {
  byId: {
    [APPLICATION_ID]: {
      id: APPLICATION_ID,
      universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
    } as FlatApplication,
  },
  idByUniversalIdentifier: {
    [APPLICATION_UNIVERSAL_IDENTIFIER]: APPLICATION_ID,
  },
};

const invoiceFlatObjectMetadata = getFlatObjectMetadataMock({
  id: OBJECT_METADATA_ID,
  universalIdentifier: OBJECT_METADATA_ID,
  nameSingular: 'invoice',
  namePlural: 'invoices',
  applicationId: APPLICATION_ID,
  applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
});

const buildFlatFieldMetadata = (
  overrides: Pick<FlatFieldMetadata, 'name' | 'type'> &
    Partial<FlatFieldMetadata>,
): FlatFieldMetadata =>
  getFlatFieldMetadataMock({
    id: `${overrides.name}-field-id`,
    universalIdentifier: `${overrides.name}-field-universal-identifier`,
    objectMetadataId: OBJECT_METADATA_ID,
    objectMetadataUniversalIdentifier: OBJECT_METADATA_ID,
    applicationId: APPLICATION_ID,
    applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
    ...overrides,
  });

const buildFlatIndexMetadata = ({
  name,
  flatFieldMetadatas,
  ...overrides
}: {
  name: string;
  flatFieldMetadatas: FlatFieldMetadata[];
} & Partial<FlatIndexMetadata>): FlatIndexMetadata =>
  getFlatIndexMetadataMock({
    id: `${name}-id`,
    universalIdentifier: `${name}-universal-identifier`,
    name,
    objectMetadataId: OBJECT_METADATA_ID,
    objectMetadataUniversalIdentifier: OBJECT_METADATA_ID,
    applicationId: APPLICATION_ID,
    applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
    isUnique: true,
    isSystemSideEffect: true,
    flatIndexFieldMetadatas: flatFieldMetadatas.map(
      (flatFieldMetadata, order) => ({
        id: `${name}-field-${order}`,
        universalIdentifier: `${name}-field-${order}`,
        workspaceId: 'workspace-id',
        createdAt: NOW,
        updatedAt: NOW,
        indexMetadataId: `${name}-id`,
        fieldMetadataId: flatFieldMetadata.id,
        subFieldName: null,
        order,
      }),
    ),
    ...overrides,
  });

const numberFlatFieldMetadata = buildFlatFieldMetadata({
  name: 'number',
  type: FieldMetadataType.TEXT,
});
const referenceFlatFieldMetadata = buildFlatFieldMetadata({
  name: 'reference',
  type: FieldMetadataType.TEXT,
});
const companyFlatFieldMetadata = buildFlatFieldMetadata({
  name: 'company',
  type: FieldMetadataType.RELATION,
  settings: { relationType: RelationType.MANY_TO_ONE },
});
const groupHashFlatFieldMetadata = buildFlatFieldMetadata({
  name: 'groupHash',
  type: FieldMetadataType.TEXT,
  universalIdentifier:
    INDEX_LEVEL_UNIQUE_STANDARD_FIELD_UNIVERSAL_IDENTIFIERS.accessGroupGroupHash,
});

const buildReplacements = (flatIndexMetadatas: FlatIndexMetadata[]) =>
  buildUniqueFieldIndexReplacements({
    flatObjectMetadataMaps: buildFlatEntityMaps([invoiceFlatObjectMetadata]),
    flatFieldMetadataMaps: buildFlatEntityMaps([
      numberFlatFieldMetadata,
      referenceFlatFieldMetadata,
      companyFlatFieldMetadata,
      groupHashFlatFieldMetadata,
    ]),
    flatIndexMaps: buildFlatEntityMaps(flatIndexMetadatas),
    flatApplicationMaps,
    now: NOW,
  });

describe('buildUniqueFieldIndexReplacements', () => {
  it('replaces the index backing a unique field with one limited to non-deleted records', () => {
    const legacyFlatIndexMetadata = buildFlatIndexMetadata({
      name: 'IDX_UNIQUE_number',
      flatFieldMetadatas: [numberFlatFieldMetadata],
    });

    const [replacement, ...otherReplacements] = buildReplacements([
      legacyFlatIndexMetadata,
    ]);

    expect(otherReplacements).toEqual([]);
    expect(replacement.legacyFlatIndexMetadata).toBe(legacyFlatIndexMetadata);
    expect(replacement.legacyApplicationUniversalIdentifier).toBe(
      APPLICATION_UNIVERSAL_IDENTIFIER,
    );
    expect(replacement.isReplacementAlreadyCreated).toBe(false);
    expect(replacement.replacementFlatIndexMetadata).toMatchObject({
      indexWhereClause: '"deletedAt" IS NULL',
      isUnique: true,
      isSystemSideEffect: true,
      objectMetadataUniversalIdentifier: OBJECT_METADATA_ID,
      applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
      universalFlatIndexFieldMetadatas: [
        {
          fieldMetadataUniversalIdentifier:
            numberFlatFieldMetadata.universalIdentifier,
          order: 0,
          subFieldName: null,
        },
      ],
    });
    expect(replacement.replacementFlatIndexMetadata.name).not.toBe(
      legacyFlatIndexMetadata.name,
    );
  });

  it('flags a replacement that already exists', () => {
    const legacyFlatIndexMetadata = buildFlatIndexMetadata({
      name: 'IDX_UNIQUE_number',
      flatFieldMetadatas: [numberFlatFieldMetadata],
    });
    const [{ replacementFlatIndexMetadata }] = buildReplacements([
      legacyFlatIndexMetadata,
    ]);

    const replacements = buildReplacements([
      legacyFlatIndexMetadata,
      buildFlatIndexMetadata({
        name: replacementFlatIndexMetadata.name,
        universalIdentifier: replacementFlatIndexMetadata.universalIdentifier,
        indexWhereClause: '"deletedAt" IS NULL',
        flatFieldMetadatas: [numberFlatFieldMetadata],
      }),
    ]);

    expect(replacements).toHaveLength(1);
    expect(replacements[0].isReplacementAlreadyCreated).toBe(true);
  });

  it('leaves every other index untouched', () => {
    expect(
      buildReplacements([
        buildFlatIndexMetadata({
          name: 'IDX_UNIQUE_already_partial',
          flatFieldMetadatas: [numberFlatFieldMetadata],
          indexWhereClause: '"deletedAt" IS NULL',
        }),
        buildFlatIndexMetadata({
          name: 'IDX_UNIQUE_declared_by_an_application',
          flatFieldMetadatas: [referenceFlatFieldMetadata],
          isSystemSideEffect: false,
        }),
        buildFlatIndexMetadata({
          name: 'IDX_not_unique',
          flatFieldMetadatas: [referenceFlatFieldMetadata],
          isUnique: false,
        }),
        buildFlatIndexMetadata({
          name: 'IDX_UNIQUE_multi_field',
          flatFieldMetadatas: [
            numberFlatFieldMetadata,
            referenceFlatFieldMetadata,
          ],
        }),
        buildFlatIndexMetadata({
          name: 'IDX_UNIQUE_relation',
          flatFieldMetadatas: [companyFlatFieldMetadata],
        }),
        buildFlatIndexMetadata({
          name: 'IDX_UNIQUE_index_level_standard_field',
          flatFieldMetadatas: [groupHashFlatFieldMetadata],
        }),
      ]),
    ).toEqual([]);
  });
});
