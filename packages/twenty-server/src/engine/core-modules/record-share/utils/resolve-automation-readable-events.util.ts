import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { type ObjectRecordEvent } from 'twenty-shared/database-events';

import { findActiveFlatApplicationByUniversalIdentifier } from 'src/engine/core-modules/application/utils/find-active-flat-application-by-universal-identifier.util';
import { type RecordAccessPolicyService } from 'src/engine/core-modules/record-share/services/record-access-policy.service';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { resolveEventsReadableByRole } from 'src/engine/metadata-modules/permissions/utils/resolve-events-readable-by-role.util';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';
import { STANDARD_ROLE } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-role.constant';

export const resolveAutomationReadableEvents = async <
  TEvent extends ObjectRecordEvent,
>({
  payload,
  workspaceCacheService,
  recordAccessPolicyService,
}: {
  payload: WorkspaceEventBatch<TEvent>;
  workspaceCacheService: WorkspaceCacheService;
  recordAccessPolicyService: RecordAccessPolicyService;
}): Promise<TEvent[]> => {
  const {
    flatApplicationMaps,
    flatRoleMaps,
    rolesPermissions,
    roleIdsWithAllRecordsAccess,
    flatRowLevelPermissionPredicateMaps,
    flatRowLevelPermissionPredicateGroupMaps,
    flatFieldMetadataMaps,
    flatObjectMetadataMaps,
  } = await workspaceCacheService.getOrRecompute(payload.workspaceId, [
    'flatApplicationMaps',
    'flatRoleMaps',
    'rolesPermissions',
    'roleIdsWithAllRecordsAccess',
    'flatRowLevelPermissionPredicateMaps',
    'flatRowLevelPermissionPredicateGroupMaps',
    'flatFieldMetadataMaps',
    'flatObjectMetadataMaps',
  ]);

  const standardApplication = findActiveFlatApplicationByUniversalIdentifier(
    flatApplicationMaps,
    TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
  );

  return resolveEventsReadableByRole({
    intersectionOf: {
      applicationRoleId:
        standardApplication?.defaultRoleId ??
        findFlatEntityByUniversalIdentifier({
          flatEntityMaps: flatRoleMaps,
          universalIdentifier: STANDARD_ROLE.admin.universalIdentifier,
        })?.id ??
        null,
    },
    owningApplicationId: standardApplication?.id,
    workspaceEventBatch: payload,
    eventRecordAccessGate:
      recordAccessPolicyService.buildEventRecordAccessGate(payload),
    rolesPermissions,
    roleIdsWithAllRecordsAccess,
    flatRowLevelPermissionPredicateMaps,
    flatRowLevelPermissionPredicateGroupMaps,
    flatFieldMetadataMaps,
    flatObjectMetadataMaps,
    flatApplicationMaps,
  });
};
