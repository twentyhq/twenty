import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FieldMetadataType } from 'twenty-shared/types';

import { buildUnselectableRelationWarningsByFieldName } from 'src/engine/core-modules/record-crud/utils/build-unselectable-relation-warnings.util';
import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';

type BuildUnselectableRelationWarningsArgs = Parameters<
  typeof buildUnselectableRelationWarningsByFieldName
>[0];

type TestFlatFieldMetadata = NonNullable<
  BuildUnselectableRelationWarningsArgs['flatFieldMetadataMaps']['byUniversalIdentifier'][string]
>;

type TestFlatObjectMetadata = NonNullable<
  BuildUnselectableRelationWarningsArgs['flatObjectMetadataMaps']['byUniversalIdentifier'][string]
>;

const WORKSPACE_ID = 'workspace-id';
const APPLICATION_ID = 'application-id';
const OPPORTUNITY_OBJECT_ID = 'opportunity-object-id';
const COMPANY_OBJECT_ID = 'company-object-id';
const TIMELINE_ACTIVITY_OBJECT_ID = 'timeline-activity-object-id';

const createRelationField = ({
  id,
  name,
  relationTargetObjectMetadataId,
}: {
  id: string;
  name: string;
  relationTargetObjectMetadataId: string;
}): TestFlatFieldMetadata => ({
  id,
  universalIdentifier: id,
  applicationId: APPLICATION_ID,
  workspaceId: WORKSPACE_ID,
  type: FieldMetadataType.RELATION,
  name,
  relationTargetObjectMetadataId,
});

const createObject = ({
  id,
  nameSingular,
  universalIdentifier = id,
}: {
  id: string;
  nameSingular: string;
  universalIdentifier?: string;
}): TestFlatObjectMetadata => ({
  id,
  universalIdentifier,
  applicationId: APPLICATION_ID,
  workspaceId: WORKSPACE_ID,
  nameSingular,
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

const buildArgs = (): BuildUnselectableRelationWarningsArgs => ({
  objectName: 'opportunity',
  flatObjectMetadata: {
    id: OPPORTUNITY_OBJECT_ID,
    fieldIds: ['opportunity-company', 'opportunity-timeline-activities'],
  },
  flatFieldMetadataMaps: buildFlatEntityMaps([
    createRelationField({
      id: 'opportunity-company',
      name: 'company',
      relationTargetObjectMetadataId: COMPANY_OBJECT_ID,
    }),
    createRelationField({
      id: 'opportunity-timeline-activities',
      name: 'timelineActivities',
      relationTargetObjectMetadataId: TIMELINE_ACTIVITY_OBJECT_ID,
    }),
  ]),
  flatObjectMetadataMaps: buildFlatEntityMaps([
    createObject({ id: COMPANY_OBJECT_ID, nameSingular: 'company' }),
    createObject({
      id: TIMELINE_ACTIVITY_OBJECT_ID,
      nameSingular: 'timelineActivity',
      universalIdentifier:
        STANDARD_OBJECTS.timelineActivity.universalIdentifier,
    }),
  ]),
  selectableRelationFields: {},
  objectsPermissions: {
    [OPPORTUNITY_OBJECT_ID]: { restrictedFields: {} },
  },
});

describe('buildUnselectableRelationWarningsByFieldName', () => {
  it('should not blame read access for relations excluded from nested selection', () => {
    const warnings = buildUnselectableRelationWarningsByFieldName(buildArgs());

    expect(warnings.get('timelineActivities')).toBe(
      "Field 'timelineActivities' on opportunity cannot be selected as a nested relation. Query timelineActivity records directly instead.",
    );
  });

  it('should report missing read access for other unselectable relations', () => {
    const warnings = buildUnselectableRelationWarningsByFieldName(buildArgs());

    expect(warnings.get('company')).toBe(
      "Field 'company' on opportunity cannot be selected because you do not have read access to company.",
    );
  });
});
