import { type ObjectRecordEvent } from 'twenty-shared/database-events';
import { type ObjectsPermissionsByRoleId } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type EventRecordAccessGate } from 'src/engine/core-modules/record-share/types/event-record-access-gate.type';
import { buildRoleRowAccessPolicySubject } from 'src/engine/core-modules/record-share/utils/build-role-row-access-policy-subject.util';
import { isUpdateOfHiddenFieldsOnly } from 'src/engine/core-modules/record-share/utils/is-update-of-hidden-fields-only.util';
import { omitRestrictedFieldsFromEvent } from 'src/engine/core-modules/record-share/utils/omit-restricted-fields-from-event.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatRowLevelPermissionPredicateMaps } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-maps.type';
import { type FlatRowLevelPermissionPredicateGroupMaps } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-group-maps.type';
import { type WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';

export const resolveApplicationAdmittedEvents = async <
  TEvent extends ObjectRecordEvent,
>({
  application,
  workspaceEventBatch,
  eventRecordAccessGate,
  rolesPermissions,
  roleIdsWithAllRecordsAccess,
  flatRowLevelPermissionPredicateMaps,
  flatRowLevelPermissionPredicateGroupMaps,
  flatFieldMetadataMaps,
}: {
  application: FlatApplication;
  workspaceEventBatch: WorkspaceEventBatch<TEvent>;
  eventRecordAccessGate: EventRecordAccessGate;
  rolesPermissions: ObjectsPermissionsByRoleId;
  roleIdsWithAllRecordsAccess: string[];
  flatRowLevelPermissionPredicateMaps: FlatRowLevelPermissionPredicateMaps;
  flatRowLevelPermissionPredicateGroupMaps: FlatRowLevelPermissionPredicateGroupMaps;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}): Promise<TEvent[]> => {
  const applicationRoleId = application.defaultRoleId;
  const applicationObjectsPermissions = isDefined(applicationRoleId)
    ? rolesPermissions[applicationRoleId]
    : undefined;

  // An application receives what its role lets it read, as through the
  // API: without a role it reads nothing.
  if (
    !isDefined(applicationRoleId) ||
    !isDefined(applicationObjectsPermissions)
  ) {
    return [];
  }

  const admittedRecordIds =
    await eventRecordAccessGate.resolveAdmittedRecordIds(
      buildRoleRowAccessPolicySubject({
        roleId: applicationRoleId,
        owningApplicationId: application.id,
        rolesPermissions,
        roleIdsWithAllRecordsAccess,
        flatRowLevelPermissionPredicateMaps,
        flatRowLevelPermissionPredicateGroupMaps,
        flatFieldMetadataMaps,
      }),
    );
  const restrictedFields =
    applicationObjectsPermissions[workspaceEventBatch.objectMetadata.id]
      ?.restrictedFields;

  return workspaceEventBatch.events
    .filter((event) => admittedRecordIds.has(event.recordId))
    .map((event) =>
      omitRestrictedFieldsFromEvent({
        event,
        restrictedFields,
        flatFieldMetadataMaps,
      }),
    )
    .filter((event) => !isUpdateOfHiddenFieldsOnly(event));
};
