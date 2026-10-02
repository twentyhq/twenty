import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { IndexType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-or-throw.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { generateFlatIndexMetadataWithNameOrThrow } from 'src/engine/metadata-modules/index-metadata/utils/generate-flat-index.util';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';
import { type UniversalFlatIndexMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-index-metadata.type';

type RecordShareIndexDefinition = {
  universalIdentifier: string;
  fieldUniversalIdentifiers: string[];
};

const RECORD_SHARE_FIELDS = STANDARD_OBJECTS.recordShare.fields;

export const PRINCIPAL_ID_OBJECT_METADATA_ID_INDEX: RecordShareIndexDefinition =
  {
    universalIdentifier:
      STANDARD_OBJECTS.recordShare.indexes.principalIdObjectMetadataIdIndex
        .universalIdentifier,
    fieldUniversalIdentifiers: [
      RECORD_SHARE_FIELDS.principalId.universalIdentifier,
      RECORD_SHARE_FIELDS.objectMetadataId.universalIdentifier,
    ],
  };

// No longer declared by the standard application, so frozen here for the rollback
export const LEGACY_RECORD_SHARE_INDEXES: RecordShareIndexDefinition[] = [
  {
    universalIdentifier: '66fbc3d2-6126-4e29-a306-dbe9995bf062',
    fieldUniversalIdentifiers: [
      RECORD_SHARE_FIELDS.principalId.universalIdentifier,
    ],
  },
  {
    universalIdentifier: '21b84593-c647-40ce-bdf4-a8b4ac658f57',
    fieldUniversalIdentifiers: [
      RECORD_SHARE_FIELDS.sourceId.universalIdentifier,
    ],
  },
];

export type RecordShareIndexToCreate = {
  universalFlatIndexMetadata: UniversalFlatIndexMetadata;
  columnNames: string[];
};

export type RecordShareIndexSyncPlan = {
  indexesToCreate: RecordShareIndexToCreate[];
  indexesToDelete: FlatIndexMetadata[];
};

const buildRecordShareIndexToCreateOrThrow = ({
  indexDefinition,
  recordShareFlatObjectMetadata,
  flatFieldMetadataMaps,
  now,
}: {
  indexDefinition: RecordShareIndexDefinition;
  recordShareFlatObjectMetadata: FlatObjectMetadata;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  now: string;
}): RecordShareIndexToCreate => {
  const indexedFlatFieldMetadatas =
    indexDefinition.fieldUniversalIdentifiers.map((fieldUniversalIdentifier) =>
      findFlatEntityByUniversalIdentifierOrThrow<FlatFieldMetadata>({
        flatEntityMaps: flatFieldMetadataMaps,
        universalIdentifier: fieldUniversalIdentifier,
      }),
    );

  const universalFlatIndexMetadata = generateFlatIndexMetadataWithNameOrThrow({
    flatObjectMetadata: recordShareFlatObjectMetadata,
    objectFlatFieldMetadatas: indexedFlatFieldMetadatas,
    flatIndex: {
      createdAt: now,
      updatedAt: now,
      universalIdentifier: indexDefinition.universalIdentifier,
      applicationUniversalIdentifier:
        TWENTY_STANDARD_APPLICATION.universalIdentifier,
      objectMetadataUniversalIdentifier:
        recordShareFlatObjectMetadata.universalIdentifier,
      indexType: IndexType.BTREE,
      indexWhereClause: null,
      isCustom: false,
      isUnique: false,
      isSystemSideEffect: true,
      universalFlatIndexFieldMetadatas: indexedFlatFieldMetadatas.map(
        (flatFieldMetadata, order) => ({
          createdAt: now,
          updatedAt: now,
          indexMetadataUniversalIdentifier: indexDefinition.universalIdentifier,
          fieldMetadataUniversalIdentifier: flatFieldMetadata.universalIdentifier,
          order,
          subFieldName: null,
        }),
      ),
    },
  });

  return {
    universalFlatIndexMetadata,
    columnNames: indexedFlatFieldMetadatas.map(({ name }) => name),
  };
};

export const buildRecordShareIndexSyncPlanOrThrow = ({
  recordShareFlatObjectMetadata,
  flatFieldMetadataMaps,
  flatIndexMaps,
  direction,
  now,
}: {
  recordShareFlatObjectMetadata: FlatObjectMetadata;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  flatIndexMaps: Pick<FlatEntityMaps<FlatIndexMetadata>, 'byUniversalIdentifier'>;
  direction: 'up' | 'down';
  now: string;
}): RecordShareIndexSyncPlan => {
  const targetIndexDefinitions =
    direction === 'up'
      ? [PRINCIPAL_ID_OBJECT_METADATA_ID_INDEX]
      : LEGACY_RECORD_SHARE_INDEXES;
  const obsoleteIndexDefinitions =
    direction === 'up'
      ? LEGACY_RECORD_SHARE_INDEXES
      : [PRINCIPAL_ID_OBJECT_METADATA_ID_INDEX];

  return {
    indexesToCreate: targetIndexDefinitions
      .filter(
        ({ universalIdentifier }) =>
          !isDefined(flatIndexMaps.byUniversalIdentifier[universalIdentifier]),
      )
      .map((indexDefinition) =>
        buildRecordShareIndexToCreateOrThrow({
          indexDefinition,
          recordShareFlatObjectMetadata,
          flatFieldMetadataMaps,
          now,
        }),
      ),
    indexesToDelete: obsoleteIndexDefinitions
      .map(
        ({ universalIdentifier }) =>
          flatIndexMaps.byUniversalIdentifier[universalIdentifier],
      )
      .filter(isDefined),
  };
};
