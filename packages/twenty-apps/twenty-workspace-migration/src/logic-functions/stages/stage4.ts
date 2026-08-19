import {
  migrationState,
  saveMigrationStateCheckpoint,
  setStateRef
} from "src/logic-functions/utils/migration-state.util";
import { findViews } from "src/logic-functions/requests/find-views.util";
import { findNavigationMenuItems } from "src/logic-functions/requests/find-navigation-menu-items.util";
import { findSkills } from "src/logic-functions/requests/find-skills.util";
import { findWebhooks } from "src/logic-functions/requests/find-webhooks.util";
import { findRoles } from "src/logic-functions/requests/find-roles.util";
import { type AxiosInstance } from "axios";
import { migrateNavigationMenuItems } from "src/logic-functions/migration/migrate-navigation-menu-items.util";
import { migrateRoles } from "src/logic-functions/migration/migrate-roles.util";
import { migrateWebhooks } from "src/logic-functions/migration/migrate-webhooks.util";
import { migrateSkills } from "src/logic-functions/migration/migrate-skills.util";
import { migrateViews } from "src/logic-functions/migration/migrate-views.util";

export const stage4 = async (sourceWorkspace: AxiosInstance, targetWorkspace: AxiosInstance) => {
  const targetFieldIdBySourceFieldId = migrationState.targetFieldIdBySourceFieldId;
  const targetObjectIdBySourceObjectId = migrationState.targetObjectIdBySourceObjectId;
  const recordIdMap = migrationState.recordIdMap;

  const sourceViews = await findViews(sourceWorkspace);
  const targetViews = await findViews(targetWorkspace);
  await migrateViews(targetWorkspace, sourceViews, targetViews, targetObjectIdBySourceObjectId, targetFieldIdBySourceFieldId);

  const sourceNavigationMenuItems = await findNavigationMenuItems(sourceWorkspace);
  const targetNavigationMenuItems = await findNavigationMenuItems(targetWorkspace);
  await migrateNavigationMenuItems(targetWorkspace, sourceNavigationMenuItems, targetNavigationMenuItems, targetObjectIdBySourceObjectId, recordIdMap);

  const sourceSkills = await findSkills(sourceWorkspace);
  const targetSkills = await findSkills(targetWorkspace);
  await migrateSkills(targetWorkspace, sourceSkills, targetSkills);

  const sourceWebhooks = await findWebhooks(sourceWorkspace);
  await migrateWebhooks(targetWorkspace, sourceWebhooks);

  const sourceRoles = await findRoles(sourceWorkspace);
  const targetRoles = await findRoles(targetWorkspace);
  await migrateRoles(targetWorkspace, sourceRoles, targetRoles, targetObjectIdBySourceObjectId, targetFieldIdBySourceFieldId);

  setStateRef('stage', 5);
  await saveMigrationStateCheckpoint();
}