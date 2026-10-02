import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import {
  FieldMetadataType,
  type ObjectsPermissions,
  RelationType,
} from 'twenty-shared/types';

import { getRelationsSelectFields } from 'src/engine/api/common/common-select-fields/utils/get-relations-select-fields.util';
import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

const TIMELINE_ACTIVITY_OBJECT_ID = 'timeline-activity-object-id';

const createMockField = ({
  id,
  name,
  type,
  objectMetadataId,
  relationTargetObjectMetadataId = null,
  relationType,
}: {
  id: string;
  name: string;
  type: FieldMetadataType;
  objectMetadataId: string;
  relationTargetObjectMetadataId?: string | null;
  relationType?: RelationType;
}): OrmFlatFieldMetadata =>
  ({
    id,
    name,
    type,
    objectMetadataId,
    relationTargetObjectMetadataId,
    universalIdentifier: id,
    settings: relationType ? { relationType } : null,
  }) as unknown as OrmFlatFieldMetadata;

const createMockObject = ({
  id,
  nameSingular,
  universalIdentifier = id,
  fieldIds,
}: {
  id: string;
  nameSingular: string;
  universalIdentifier?: string;
  fieldIds: string[];
}): FlatObjectMetadata =>
  ({
    id,
    nameSingular,
    universalIdentifier,
    fieldIds,
  }) as unknown as FlatObjectMetadata;

const buildFlatEntityMaps = <TEntity extends SyncableFlatEntity>(
  entities: TEntity[],
): FlatEntityMaps<TEntity> =>
  ({
    byUniversalIdentifier: Object.fromEntries(
      entities.map((entity) => [entity.universalIdentifier, entity]),
    ),
    universalIdentifierById: Object.fromEntries(
      entities.map((entity) => [entity.id, entity.universalIdentifier]),
    ),
    universalIdentifiersByApplicationId: {},
  }) as FlatEntityMaps<TEntity>;

const buildFixture = () => {
  const fields = [
    createMockField({
      id: 'opportunity-name',
      name: 'name',
      type: FieldMetadataType.TEXT,
      objectMetadataId: 'opportunity-object-id',
    }),
    createMockField({
      id: 'opportunity-company',
      name: 'company',
      type: FieldMetadataType.RELATION,
      objectMetadataId: 'opportunity-object-id',
      relationTargetObjectMetadataId: 'company-object-id',
      relationType: RelationType.MANY_TO_ONE,
    }),
    createMockField({
      id: 'opportunity-timeline-activities',
      name: 'timelineActivities',
      type: FieldMetadataType.RELATION,
      objectMetadataId: 'opportunity-object-id',
      relationTargetObjectMetadataId: TIMELINE_ACTIVITY_OBJECT_ID,
      relationType: RelationType.ONE_TO_MANY,
    }),
    createMockField({
      id: 'company-name',
      name: 'name',
      type: FieldMetadataType.TEXT,
      objectMetadataId: 'company-object-id',
    }),
    createMockField({
      id: 'company-timeline-activities',
      name: 'timelineActivities',
      type: FieldMetadataType.RELATION,
      objectMetadataId: 'company-object-id',
      relationTargetObjectMetadataId: TIMELINE_ACTIVITY_OBJECT_ID,
      relationType: RelationType.ONE_TO_MANY,
    }),
    createMockField({
      id: 'timeline-activity-happens-at',
      name: 'happensAt',
      type: FieldMetadataType.DATE_TIME,
      objectMetadataId: TIMELINE_ACTIVITY_OBJECT_ID,
    }),
  ];

  const opportunity = createMockObject({
    id: 'opportunity-object-id',
    nameSingular: 'opportunity',
    fieldIds: [
      'opportunity-name',
      'opportunity-company',
      'opportunity-timeline-activities',
    ],
  });
  const company = createMockObject({
    id: 'company-object-id',
    nameSingular: 'company',
    fieldIds: ['company-name', 'company-timeline-activities'],
  });
  const timelineActivity = createMockObject({
    id: TIMELINE_ACTIVITY_OBJECT_ID,
    nameSingular: 'timelineActivity',
    universalIdentifier: STANDARD_OBJECTS.timelineActivity.universalIdentifier,
    fieldIds: ['timeline-activity-happens-at'],
  });

  const objectsPermissions = Object.fromEntries(
    [opportunity, company, timelineActivity].map((object) => [
      object.id,
      { canReadObjectRecords: true, restrictedFields: {} },
    ]),
  ) as unknown as ObjectsPermissions;

  return {
    opportunity,
    objectsPermissions,
    flatObjectMetadataMaps: buildFlatEntityMaps([
      opportunity,
      company,
      timelineActivity,
    ]),
    flatFieldMetadataMaps: buildFlatEntityMaps(fields),
  };
};

describe('getRelationsSelectFields', () => {
  it('should expand relations but not timeline activities at depth 1', () => {
    const {
      opportunity,
      objectsPermissions,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    } = buildFixture();

    const result = getRelationsSelectFields({
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      flatObjectMetadata: opportunity,
      objectsPermissions,
      depth: 1,
    });

    expect(Object.keys(result)).toEqual(['company']);
    expect(result.company).toEqual(expect.objectContaining({ name: true }));
  });

  it('should not expand timeline activities of nested relations at depth 2', () => {
    const {
      opportunity,
      objectsPermissions,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    } = buildFixture();

    const result = getRelationsSelectFields({
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      flatObjectMetadata: opportunity,
      objectsPermissions,
      depth: 2,
    });

    expect(Object.keys(result)).toEqual(['company']);
    expect(
      (result.company as Record<string, unknown>).timelineActivities,
    ).not.toEqual(expect.any(Object));
  });
});
