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
import { migrateNavigationMenuItems } from "src/logic-functions/migration/migrate-navigation-menu-items.util";
import { migrateRoles } from "src/logic-functions/migration/migrate-roles.util";
import { migrateWebhooks } from "src/logic-functions/migration/migrate-webhooks.util";
import { migrateSkills } from "src/logic-functions/migration/migrate-skills.util";

export const stage7 = async (sourceWorkspace: AxiosInstance, targetWorkspace: AxiosInstance) => {
  const targetFieldIdBySourceFieldId = migrationState.targetFieldIdBySourceFieldId;
  const targetObjectIdBySourceObjectId = migrationState.targetObjectIdBySourceObjectId;
  const recordIdMap = migrationState.recordIdMap;
  const targetPageLayoutIdBySourcePageLayoutId = migrationState.targetPageLayoutIdBySourcePageLayoutId;

  if (migrationState.migratedNavigationMenuItems === false) {
    const sourceNavigationMenuItems = await findNavigationMenuItems(sourceWorkspace);
    const targetNavigationMenuItems = await findNavigationMenuItems(targetWorkspace);
    if (await migrateNavigationMenuItems(targetWorkspace, sourceNavigationMenuItems, targetNavigationMenuItems, targetObjectIdBySourceObjectId, recordIdMap, targetPageLayoutIdBySourcePageLayoutId)) {
      await saveMigrationStateCheckpointAndStop();
    }
    return;
  }
  if (migrationState.migratedSkills === false) {
    const sourceSkills = await findSkills(sourceWorkspace);
    const targetSkills = await findSkills(targetWorkspace);
    if (await migrateSkills(targetWorkspace, sourceSkills, targetSkills)) {
      await saveMigrationStateCheckpointAndStop();
    }
    return;
  }
  if (migrationState.migratedWebhooks === false) {
    const sourceWebhooks = await findWebhooks(sourceWorkspace);
    const targetWebhooks = await findWebhooks(targetWorkspace);
    if (await migrateWebhooks(targetWorkspace, sourceWebhooks, targetWebhooks)) {
      await saveMigrationStateCheckpointAndStop();
    }
    return;
  }
  if (migrationState.migratedRoles === false) {
    const sourceRoles = await findRoles(sourceWorkspace);
    const targetRoles = await findRoles(targetWorkspace);
    if (await migrateRoles(targetWorkspace, sourceRoles, targetRoles, targetObjectIdBySourceObjectId, targetFieldIdBySourceFieldId)) {
      setStateRef('stage', 8);
      await saveMigrationStateCheckpointAndStop();
    }
  }
}
