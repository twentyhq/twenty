import {
  migrationState,
  saveMigrationStateCheckpointAndStop,
  setStateRef
} from "src/logic-functions/utils/migration-state.util";
import { findNavigationMenuItems } from "src/logic-functions/requests/find-navigation-menu-items.util";
import { findSkills } from "src/logic-functions/requests/find-skills.util";
import { findWebhooks } from "src/logic-functions/requests/find-webhooks.util";
import { findRoles } from "src/logic-functions/requests/find-roles.util";
import { type AxiosInstance } from "axios";
import { buildRecordIdResolution } from "src/logic-functions/utils/record-id-resolution.util";
import { migrateNavigationMenuItems } from "src/logic-functions/migration/migrate-navigation-menu-items.util";
import { migrateRoles } from "src/logic-functions/migration/migrate-roles.util";
import { migrateWebhooks } from "src/logic-functions/migration/migrate-webhooks.util";
import { migrateSkills } from "src/logic-functions/migration/migrate-skills.util";
import { executeWithRetry } from "src/logic-functions/utils/execute-with-retry.util";
import { executeWithRetryAndCheckpoint } from "src/logic-functions/utils/execute-with-retry-and-checkpoint.util";

export const stage7 = async (sourceWorkspace: AxiosInstance, targetWorkspace: AxiosInstance) => {
  const targetFieldIdBySourceFieldId = migrationState.targetFieldIdBySourceFieldId;
  const targetObjectIdBySourceObjectId = migrationState.targetObjectIdBySourceObjectId;
  const recordIds = buildRecordIdResolution();
  const targetPageLayoutIdBySourcePageLayoutId = migrationState.targetPageLayoutIdBySourcePageLayoutId;

  if (migrationState.migratedNavigationMenuItems === false) {
    const [sourceNavigationMenuItems, targetNavigationMenuItems] = await Promise.all([
      executeWithRetry(() => findNavigationMenuItems(sourceWorkspace)),
      executeWithRetryAndCheckpoint(() => findNavigationMenuItems(targetWorkspace)),
    ]);
    if (await migrateNavigationMenuItems(targetWorkspace, sourceNavigationMenuItems, targetNavigationMenuItems, targetObjectIdBySourceObjectId, recordIds, targetPageLayoutIdBySourcePageLayoutId, migrationState.targetViewIdBySourceViewId) === false) {
      return;
    }
  }
  if (migrationState.migratedSkills === false) {
    const [sourceSkills, targetSkills] = await Promise.all([
      executeWithRetry(() => findSkills(sourceWorkspace)),
      executeWithRetryAndCheckpoint(() => findSkills(targetWorkspace)),
    ]);
    if (await migrateSkills(targetWorkspace, sourceSkills, targetSkills) === false) {
      return;
    }
  }
  if (migrationState.migratedWebhooks === false) {
    const [sourceWebhooks, targetWebhooks] = await Promise.all([
      executeWithRetry(() => findWebhooks(sourceWorkspace)),
      executeWithRetryAndCheckpoint(() => findWebhooks(targetWorkspace)),
    ]);
    if (await migrateWebhooks(targetWorkspace, sourceWebhooks, targetWebhooks) === false) {
      return;
    }
  }
  if (migrationState.migratedRoles === false) {
    const [sourceRoles, targetRoles] = await Promise.all([
      executeWithRetry(() => findRoles(sourceWorkspace)),
      executeWithRetryAndCheckpoint(() => findRoles(targetWorkspace)),
    ]);
    if (await migrateRoles(targetWorkspace, sourceRoles, targetRoles, targetObjectIdBySourceObjectId, targetFieldIdBySourceFieldId) === false) {
      return;
    }
  }

  setStateRef('stage', 8);
  await saveMigrationStateCheckpointAndStop();
}
