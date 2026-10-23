import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { type ObjectRecordEvent } from 'twenty-shared/database-events';
import { isDefined } from 'twenty-shared/utils';

import { findActiveFlatApplicationByUniversalIdentifier } from 'src/engine/core-modules/application/utils/find-active-flat-application-by-universal-identifier.util';
import { type RecordAccessPolicyService } from 'src/engine/core-modules/record-share/services/record-access-policy.service';
import { buildRoleRowAccessPolicySubject } from 'src/engine/core-modules/record-share/utils/build-role-row-access-policy-subject.util';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';

export const resolveAutomationAdmittedRecordIds = async ({
  payload,
  workspaceCacheService,
  recordAccessPolicyService,
}: {
  payload: WorkspaceEventBatch<ObjectRecordEvent>;
  workspaceCacheService: WorkspaceCacheService;
  recordAccessPolicyService: RecordAccessPolicyService;
}): Promise<Set<string>> => {
  const {
    flatApplicationMaps,
    rolesPermissions,
    roleIdsWithAllRecordsAccess,
    flatRowLevelPermissionPredicateMaps,
    flatRowLevelPermissionPredicateGroupMaps,
    flatFieldMetadataMaps,
    flatObjectMetadataMaps,
  } = await workspaceCacheService.getOrRecompute(payload.workspaceId, [
    'flatApplicationMaps',
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

  // Automated runs act as the standard application, so without its role they admit nothing
  if (
    !isDefined(standardApplication) ||
    !isDefined(standardApplication.defaultRoleId)
  ) {
    return new Set<string>();
  }

  return recordAccessPolicyService
    .buildEventRecordAccessGate(payload)
    .resolveAdmittedRecordIds(
      buildRoleRowAccessPolicySubject({
        roleId: standardApplication.defaultRoleId,
        owningApplicationId: standardApplication.id,
        rolesPermissions,
        roleIdsWithAllRecordsAccess,
        flatRowLevelPermissionPredicateMaps,
        flatRowLevelPermissionPredicateGroupMaps,
        flatFieldMetadataMaps,
        flatObjectMetadataMaps,
      }),
    );
};
