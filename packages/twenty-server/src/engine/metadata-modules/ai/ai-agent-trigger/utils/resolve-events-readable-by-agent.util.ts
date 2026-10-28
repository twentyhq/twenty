import { type ObjectRecordEvent } from 'twenty-shared/database-events';
import { type ObjectsPermissionsByRoleId } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type EventRecordAccessGate } from 'src/engine/core-modules/record-share/types/event-record-access-gate.type';
import { buildRoleRowAccessPolicySubject } from 'src/engine/core-modules/record-share/utils/build-role-row-access-policy-subject.util';
import { isUpdateOfHiddenFieldsOnly } from 'src/engine/core-modules/record-share/utils/is-update-of-hidden-fields-only.util';
import { isDatabaseEventCausedByAgent } from 'src/engine/metadata-modules/ai/ai-agent-trigger/utils/is-database-event-caused-by-agent.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { omitRestrictedFieldsFromEvent } from 'src/engine/metadata-modules/permissions/utils/omit-restricted-fields-from-event.util';
import { type FlatRowLevelPermissionPredicateGroupMaps } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-group-maps.type';
import { type FlatRowLevelPermissionPredicateMaps } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-maps.type';
import { restrictObjectsPermissionsToDisabledActions } from 'src/engine/twenty-orm/utils/restrict-objects-permissions-to-disabled-actions.util';
import { type WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';

export const resolveEventsReadableByAgent = async <
  TEvent extends ObjectRecordEvent,
>({
  agentId,
  agentRoleId,
  agentApplicationId,
  workspaceEventBatch,
  eventRecordAccessGate,
  rolesPermissions,
  roleIdsWithAllRecordsAccess,
  flatRowLevelPermissionPredicateMaps,
  flatRowLevelPermissionPredicateGroupMaps,
  flatFieldMetadataMaps,
  flatObjectMetadataMaps,
}: {
  agentId: string;
  agentRoleId: string | undefined;
  agentApplicationId: string;
  workspaceEventBatch: WorkspaceEventBatch<TEvent>;
  eventRecordAccessGate: EventRecordAccessGate;
  rolesPermissions: ObjectsPermissionsByRoleId;
  roleIdsWithAllRecordsAccess: string[];
  flatRowLevelPermissionPredicateMaps: FlatRowLevelPermissionPredicateMaps;
  flatRowLevelPermissionPredicateGroupMaps: FlatRowLevelPermissionPredicateGroupMaps;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
}): Promise<TEvent[]> => {
  const agentRolePermissions = isDefined(agentRoleId)
    ? rolesPermissions[agentRoleId]
    : undefined;

  // An agent receives what its role lets it read: without a role it reads nothing
  if (!isDefined(agentRoleId) || !isDefined(agentRolePermissions)) {
    return [];
  }

  // An agent never acts as the owning application, even when it belongs to it
  const objectsPermissions = restrictObjectsPermissionsToDisabledActions({
    objectsPermissions: agentRolePermissions,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
    actingApplicationId: undefined,
  });

  const admittedRecordIds =
    await eventRecordAccessGate.resolveAdmittedRecordIds(
      buildRoleRowAccessPolicySubject({
        roleId: agentRoleId,
        owningApplicationId: agentApplicationId,
        rolesPermissions: { [agentRoleId]: objectsPermissions },
        roleIdsWithAllRecordsAccess,
        flatRowLevelPermissionPredicateMaps,
        flatRowLevelPermissionPredicateGroupMaps,
        flatFieldMetadataMaps,
        flatObjectMetadataMaps,
      }),
    );

  return workspaceEventBatch.events
    .filter((event) => admittedRecordIds.has(event.recordId))
    .filter(
      (event) =>
        !isDatabaseEventCausedByAgent({
          event,
          eventName: workspaceEventBatch.name,
          agentId,
        }),
    )
    .map((event) =>
      omitRestrictedFieldsFromEvent({
        event,
        objectMetadata: workspaceEventBatch.objectMetadata,
        objectsPermissions,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      }),
    )
    .filter((event) => !isUpdateOfHiddenFieldsOnly(event));
};
