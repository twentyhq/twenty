import {
  DEFAULT_RELATIONS_OBJECTS_STANDARD_IDS,
  STANDARD_OBJECTS,
} from 'twenty-shared/metadata';
import {
  FieldMetadataType,
  IndexType,
  RelationType,
} from 'twenty-shared/types';

import {
  buildMissingSystemRelationIndexes,
  type SystemRelationHolderNameSingular,
} from 'src/database/commands/upgrade-version-command/2-42/utils/build-missing-system-relation-indexes.util';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { getFlatIndexMetadataMock } from 'src/engine/metadata-modules/flat-index-metadata/__mocks__/get-flat-index-metadata.mock';
import {
  type FlatIndexFieldMetadata,
  type FlatIndexMetadata,
} from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

const STANDARD_APP_UID = '20202020-0000-4000-8000-000000000001';
const CUSTOM_APP_UID = '20202020-0000-4000-8000-000000000002';

type TargetLegSpecification = {
  holderNameSingular: SystemRelationHolderNameSingular;
  name: string;
  applicationUniversalIdentifier?: string;
  morphId?: string;
  relationType?: RelationType;
  indexedAtPosition?: 0 | 1;
};

const addAll = <TFlatEntity extends FlatObjectMetadata | FlatFieldMetadata | FlatIndexMetadata>(
  flatEntities: TFlatEntity[],
): FlatEntityMaps<TFlatEntity> =>
  flatEntities.reduce<FlatEntityMaps<TFlatEntity>>(
    (flatEntityMaps, flatEntity) =>
      addFlatEntityToFlatEntityMapsOrThrow({ flatEntity, flatEntityMaps }),
    createEmptyFlatEntityMaps(),
  );

const buildArgs = (targetLegs: TargetLegSpecification[]) => {
  const flatFieldMetadatas: FlatFieldMetadata[] = [];
  const flatIndexMetadatas: FlatIndexMetadata[] = [];
  const fieldIdsByHolder: Record<SystemRelationHolderNameSingular, string[]> = {
    timelineActivity: [],
    attachment: [],
    noteTarget: [],
    taskTarget: [],
  };

  for (const holderNameSingular of DEFAULT_RELATIONS_OBJECTS_STANDARD_IDS) {
    const deletedAtFieldId = `field-${holderNameSingular}-deletedAt`;

    fieldIdsByHolder[holderNameSingular].push(deletedAtFieldId);
    flatFieldMetadatas.push(
      getFlatFieldMetadataMock({
        id: deletedAtFieldId,
        universalIdentifier: `uid-${deletedAtFieldId}`,
        objectMetadataId: `object-${holderNameSingular}`,
        name: 'deletedAt',
        type: FieldMetadataType.DATE_TIME,
        applicationUniversalIdentifier: STANDARD_APP_UID,
      }),
    );
  }

  for (const leg of targetLegs) {
    const fieldId = `field-${leg.holderNameSingular}-${leg.name}`;

    fieldIdsByHolder[leg.holderNameSingular].push(fieldId);
    flatFieldMetadatas.push(
      getFlatFieldMetadataMock<FieldMetadataType.MORPH_RELATION>({
        id: fieldId,
        universalIdentifier: `uid-${fieldId}`,
        objectMetadataId: `object-${leg.holderNameSingular}`,
        name: leg.name,
        type: FieldMetadataType.MORPH_RELATION,
        morphId:
          leg.morphId ??
          STANDARD_OBJECTS[leg.holderNameSingular].morphIds.targetMorphId
            .morphId,
        settings: {
          relationType: leg.relationType ?? RelationType.MANY_TO_ONE,
          joinColumnName: `${leg.name}Id`,
        },
        applicationUniversalIdentifier:
          leg.applicationUniversalIdentifier ?? CUSTOM_APP_UID,
      }),
    );

    if (leg.indexedAtPosition === undefined) {
      continue;
    }

    const indexFieldIds =
      leg.indexedAtPosition === 0
        ? [fieldId, `field-${leg.holderNameSingular}-deletedAt`]
        : [`field-${leg.holderNameSingular}-deletedAt`, fieldId];

    flatIndexMetadatas.push(
      getFlatIndexMetadataMock({
        universalIdentifier: `index-uid-${fieldId}`,
        objectMetadataId: `object-${leg.holderNameSingular}`,
        objectMetadataUniversalIdentifier:
          STANDARD_OBJECTS[leg.holderNameSingular].universalIdentifier,
        applicationUniversalIdentifier: CUSTOM_APP_UID,
        flatIndexFieldMetadatas: indexFieldIds.map(
          (indexFieldId, order): FlatIndexFieldMetadata => ({
            id: `index-field-${fieldId}-${order}`,
            indexMetadataId: `index-${fieldId}`,
            fieldMetadataId: indexFieldId,
            order,
            subFieldName: null,
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
            workspaceId: 'workspace-id',
          }),
        ),
      }),
    );
  }

  const holderFlatObjectMetadataByNameSingular = {} as Record<
    SystemRelationHolderNameSingular,
    FlatObjectMetadata
  >;

  for (const holderNameSingular of DEFAULT_RELATIONS_OBJECTS_STANDARD_IDS) {
    holderFlatObjectMetadataByNameSingular[holderNameSingular] =
      getFlatObjectMetadataMock({
        id: `object-${holderNameSingular}`,
        universalIdentifier:
          STANDARD_OBJECTS[holderNameSingular].universalIdentifier,
        applicationUniversalIdentifier: STANDARD_APP_UID,
        nameSingular: holderNameSingular,
        namePlural: `${holderNameSingular}s`,
        fieldIds: fieldIdsByHolder[holderNameSingular],
      });
  }

  return {
    flatFieldMetadataMaps: addAll(flatFieldMetadatas),
    flatIndexMaps: addAll(flatIndexMetadatas),
    holderFlatObjectMetadataByNameSingular,
    twentyStandardApplicationUniversalIdentifier: STANDARD_APP_UID,
  };
};

describe('buildMissingSystemRelationIndexes', () => {
  it('returns an index for an app-owned target leg that has none, on every holder', () => {
    const missingIndexes = buildMissingSystemRelationIndexes(
      buildArgs(
        DEFAULT_RELATIONS_OBJECTS_STANDARD_IDS.map((holderNameSingular) => ({
          holderNameSingular,
          name: 'targetSalesActionItem',
        })),
      ),
    );

    expect(
      missingIndexes.map(({ holderFlatObjectMetadata, joinColumnName }) => [
        holderFlatObjectMetadata.nameSingular,
        joinColumnName,
      ]),
    ).toEqual([
      ['timelineActivity', 'targetSalesActionItemId'],
      ['attachment', 'targetSalesActionItemId'],
      ['noteTarget', 'targetSalesActionItemId'],
      ['taskTarget', 'targetSalesActionItemId'],
    ]);

    const [{ universalFlatIndexMetadata }] = missingIndexes;

    expect(universalFlatIndexMetadata.applicationUniversalIdentifier).toBe(
      CUSTOM_APP_UID,
    );
    expect(universalFlatIndexMetadata.name).toMatch(/^IDX_/);
    expect(universalFlatIndexMetadata).toMatchObject({
      indexType: IndexType.BTREE,
      indexWhereClause: null,
      isCustom: true,
      isUnique: false,
      isSystemSideEffect: true,
      objectMetadataUniversalIdentifier:
        STANDARD_OBJECTS.timelineActivity.universalIdentifier,
    });
    expect(universalFlatIndexMetadata.universalFlatIndexFieldMetadatas).toEqual(
      [
        expect.objectContaining({
          fieldMetadataUniversalIdentifier:
            'uid-field-timelineActivity-targetSalesActionItem',
          indexMetadataUniversalIdentifier:
            universalFlatIndexMetadata.universalIdentifier,
          order: 0,
        }),
      ],
    );
  });

  it('skips legs already leading an index but not legs only in second position', () => {
    const missingIndexes = buildMissingSystemRelationIndexes(
      buildArgs([
        {
          holderNameSingular: 'timelineActivity',
          name: 'targetCalBooking',
          indexedAtPosition: 0,
        },
        {
          holderNameSingular: 'timelineActivity',
          name: 'targetStripeCustomer',
          indexedAtPosition: 1,
        },
      ]),
    );

    expect(missingIndexes.map(({ joinColumnName }) => joinColumnName)).toEqual([
      'targetStripeCustomerId',
    ]);
  });

  it('leaves standard-owned legs, foreign morph ids and one-to-many sides alone', () => {
    const missingIndexes = buildMissingSystemRelationIndexes(
      buildArgs([
        {
          holderNameSingular: 'timelineActivity',
          name: 'targetMessageList',
          applicationUniversalIdentifier: STANDARD_APP_UID,
        },
        {
          holderNameSingular: 'timelineActivity',
          name: 'targetOther',
          morphId: '20202020-0000-4000-8000-00000000ffff',
        },
        {
          holderNameSingular: 'attachment',
          name: 'targetInverse',
          relationType: RelationType.ONE_TO_MANY,
        },
      ]),
    );

    expect(missingIndexes).toEqual([]);
  });
});
