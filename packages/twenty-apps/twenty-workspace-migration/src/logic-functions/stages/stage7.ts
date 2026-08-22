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
    const sourceNavigationMenuItems = await executeWithRetry(() => findNavigationMenuItems(sourceWorkspace));
    const targetNavigationMenuItems = await executeWithRetryAndCheckpoint(() => findNavigationMenuItems(targetWorkspace));
    if (await migrateNavigationMenuItems(targetWorkspace, sourceNavigationMenuItems, targetNavigationMenuItems, targetObjectIdBySourceObjectId, recordIds, targetPageLayoutIdBySourcePageLayoutId) === false) {
      return;
    }
  }
  if (migrationState.migratedSkills === false) {
    const sourceSkills = await executeWithRetry(() => findSkills(sourceWorkspace));
    const targetSkills = await executeWithRetryAndCheckpoint(() => findSkills(targetWorkspace));
    if (await migrateSkills(targetWorkspace, sourceSkills, targetSkills) === false) {
      return;
    }
  }
  if (migrationState.migratedWebhooks === false) {
    const sourceWebhooks = await executeWithRetry(() => findWebhooks(sourceWorkspace));
    const targetWebhooks = await executeWithRetryAndCheckpoint(() => findWebhooks(targetWorkspace));
    if (await migrateWebhooks(targetWorkspace, sourceWebhooks, targetWebhooks) === false) {
      return;
    }
  }
  if (migrationState.migratedRoles === false) {
    const sourceRoles = await executeWithRetry(() => findRoles(sourceWorkspace));
    const targetRoles = await executeWithRetryAndCheckpoint(() => findRoles(targetWorkspace));
    if (await migrateRoles(targetWorkspace, sourceRoles, targetRoles, targetObjectIdBySourceObjectId, targetFieldIdBySourceFieldId) === false) {
      return;
    }
  }

  setStateRef('stage', 8);
  await saveMigrationStateCheckpointAndStop();
}
