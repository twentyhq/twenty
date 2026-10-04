import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import { getRelationsSelectFields } from 'src/engine/api/common/common-select-fields/utils/get-relations-select-fields.util';
import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';

type GetRelationsSelectFieldsArgs = Parameters<
  typeof getRelationsSelectFields
>[0];

type TestFlatObjectMetadata =
  GetRelationsSelectFieldsArgs['flatObjectMetadata'];

type TestFlatFieldMetadata = NonNullable<
  GetRelationsSelectFieldsArgs['flatFieldMetadataMaps']['byUniversalIdentifier'][string]
>;

const WORKSPACE_ID = 'workspace-id';
const APPLICATION_ID = 'application-id';
const OPPORTUNITY_OBJECT_ID = 'opportunity-object-id';
const COMPANY_OBJECT_ID = 'company-object-id';
const PERSON_OBJECT_ID = 'person-object-id';
const TIMELINE_ACTIVITY_OBJECT_ID = 'timeline-activity-object-id';

const createField = ({
  id,
  name,
  type,
  relationTargetObjectMetadataId = null,
  relationType,
}: {
  id: string;
  name: string;
  type: FieldMetadataType;
  relationTargetObjectMetadataId?: string | null;
  relationType?: RelationType;
}): TestFlatFieldMetadata => ({
  id,
  universalIdentifier: id,
  applicationId: APPLICATION_ID,
  workspaceId: WORKSPACE_ID,
  type,
  name,
  settings: relationType ? { relationType } : null,
  relationTargetObjectMetadataId,
});

const createObject = ({
  id,
  nameSingular,
  universalIdentifier = id,
  fieldIds,
}: {
  id: string;
  nameSingular: string;
  universalIdentifier?: string;
  fieldIds: string[];
}): TestFlatObjectMetadata => ({
  id,
  universalIdentifier,
  applicationId: APPLICATION_ID,
  workspaceId: WORKSPACE_ID,
  fieldIds,
  nameSingular,
  labelIdentifierFieldMetadataId: null,
  imageIdentifierFieldMetadataId: null,
});

const buildFlatEntityMaps = <TEntity extends SyncableFlatEntity>(
  entities: TEntity[],
): FlatEntityMaps<TEntity> => ({
  byUniversalIdentifier: Object.fromEntries(
    entities.map((entity) => [entity.universalIdentifier, entity]),
  ),
  universalIdentifierById: Object.fromEntries(
    entities.map((entity) => [entity.id, entity.universalIdentifier]),
  ),
  universalIdentifiersByApplicationId: {},
});

const buildArgs = (
  depth: GetRelationsSelectFieldsArgs['depth'],
): GetRelationsSelectFieldsArgs => {
  const opportunity = createObject({
    id: OPPORTUNITY_OBJECT_ID,
    nameSingular: 'opportunity',
    fieldIds: [
      'opportunity-name',
      'opportunity-company',
      'opportunity-timeline-activities',
    ],
  });
  const company = createObject({
    id: COMPANY_OBJECT_ID,
    nameSingular: 'company',
    fieldIds: [
      'company-name',
      'company-account-owner',
      'company-timeline-activities',
    ],
  });
  const person = createObject({
    id: PERSON_OBJECT_ID,
    nameSingular: 'person',
    fieldIds: ['person-name'],
  });
  const timelineActivity = createObject({
    id: TIMELINE_ACTIVITY_OBJECT_ID,
    nameSingular: 'timelineActivity',
    universalIdentifier: STANDARD_OBJECTS.timelineActivity.universalIdentifier,
    fieldIds: ['timeline-activity-happens-at'],
  });
  const objects = [opportunity, company, person, timelineActivity];

  const fields = [
    createField({
      id: 'opportunity-name',
      name: 'name',
      type: FieldMetadataType.TEXT,
    }),
    createField({
      id: 'opportunity-company',
      name: 'company',
      type: FieldMetadataType.RELATION,
      relationTargetObjectMetadataId: COMPANY_OBJECT_ID,
      relationType: RelationType.MANY_TO_ONE,
    }),
    createField({
      id: 'opportunity-timeline-activities',
      name: 'timelineActivities',
      type: FieldMetadataType.RELATION,
      relationTargetObjectMetadataId: TIMELINE_ACTIVITY_OBJECT_ID,
      relationType: RelationType.ONE_TO_MANY,
    }),
    createField({
      id: 'company-name',
      name: 'name',
      type: FieldMetadataType.TEXT,
    }),
    createField({
      id: 'company-account-owner',
      name: 'accountOwner',
      type: FieldMetadataType.RELATION,
      relationTargetObjectMetadataId: PERSON_OBJECT_ID,
      relationType: RelationType.MANY_TO_ONE,
    }),
    createField({
      id: 'person-name',
      name: 'name',
      type: FieldMetadataType.TEXT,
    }),
    createField({
      id: 'company-timeline-activities',
      name: 'timelineActivities',
      type: FieldMetadataType.RELATION,
      relationTargetObjectMetadataId: TIMELINE_ACTIVITY_OBJECT_ID,
      relationType: RelationType.ONE_TO_MANY,
    }),
    createField({
      id: 'timeline-activity-happens-at',
      name: 'happensAt',
      type: FieldMetadataType.DATE_TIME,
    }),
  ];

  return {
    flatObjectMetadataMaps: buildFlatEntityMaps(objects),
    flatFieldMetadataMaps: buildFlatEntityMaps(fields),
    flatObjectMetadata: opportunity,
    objectsPermissions: Object.fromEntries(
      objects.map((object) => [
        object.id,
        { canReadObjectRecords: true, restrictedFields: {} },
      ]),
    ),
    depth,
  };
};

// A relation selected as `true` is not loaded: only object selections are expanded into nested queries
describe('getRelationsSelectFields', () => {
  it('should expand relations but not timeline activities at depth 1', () => {
    expect(getRelationsSelectFields(buildArgs(1))).toEqual({
      company: { name: true, accountOwnerId: true, timelineActivities: true },
    });
  });

  it('should only expand relations listed in fieldNamesToSelect at depth 1', () => {
    expect(
      getRelationsSelectFields({
        ...buildArgs(1),
        fieldNamesToSelect: new Set(['name']),
      }),
    ).toEqual({});

    expect(
      getRelationsSelectFields({
        ...buildArgs(1),
        fieldNamesToSelect: new Set(['company']),
      }),
    ).toEqual({
      company: { name: true, accountOwnerId: true, timelineActivities: true },
    });
  });

  it('should expand nested relations but not their timeline activities at depth 2', () => {
    expect(getRelationsSelectFields(buildArgs(2))).toEqual({
      company: {
        name: true,
        accountOwnerId: true,
        timelineActivities: true,
        accountOwner: { name: true },
      },
    });
  });
});
