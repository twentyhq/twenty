import { type AxiosInstance } from "axios";
import { findObjectRecordCounts } from "src/logic-functions/requests/find-object-record-counts.util";
import { findViews } from "src/logic-functions/requests/find-views.util";
import { findNavigationMenuItems } from "src/logic-functions/requests/find-navigation-menu-items.util";
import { findSkills } from "src/logic-functions/requests/find-skills.util";
import { findWebhooks } from "src/logic-functions/requests/find-webhooks.util";
import { findRoles } from "src/logic-functions/requests/find-roles.util";
import { findPageLayouts } from "src/logic-functions/requests/find-page-layouts.util";
import { PAGE_SIZE } from "src/constants/page-size";
import { migrationState } from "src/logic-functions/utils/migration-state.util";
import { Role } from "src/logic-functions/types/role.type";
import { View } from "src/logic-functions/types/view-entities.type";
import { executeWithRetry } from "src/logic-functions/utils/execute-with-retry.util";
import { objectsToOmitFromCounting } from "src/constants/to-omit";

export type MigrationDurationEstimate = {
  batchableRecordCount: number;
  otherRecordCount: number;
  estimatedMinutes: number;
};

const REQUESTS_PER_DASHBOARD = 3; // createPageLayout + updatePageLayoutWithTabsAndWidgets + createManyRecords(1)
const REQUESTS_PER_RECORD_PAGE_LAYOUT = 2; // createPageLayout + updatePageLayoutWithTabsAndWidgets
const REQUESTS_PER_ATTACHMENT = 5; // download + createFileUpload + upload PUT + completeFileUpload + createManyRecords(1)

const countViewRequests = (views: View[]): number =>
  views.reduce(
    (sum, view) =>
      sum
      + 1 // createView
      + view.viewFieldGroups.length
      + view.viewFields.length
      + view.viewFilterGroups.length
      + view.viewFilters.length
      + view.viewSorts.length
      + view.viewGroups.length,
    0,
  );

const countRoleRequests = (roles: Role[]): number =>
  roles.reduce(
    (sum, role) =>
      sum
      + 1 // createOneRole
      + (role.permissionFlags.length > 0 ? 1 : 0)
      + (role.objectPermissions.length > 0 ? 1 : 0)
      + (role.fieldPermissions.length > 0 ? 1 : 0),
    0,
  );

export const estimateMigrationDuration = async (
  sourceWorkspace: AxiosInstance,
): Promise<MigrationDurationEstimate> => {
  const recordCountsByNamePlural = await executeWithRetry(() => findObjectRecordCounts(sourceWorkspace));
  const batchableObjects = recordCountsByNamePlural;
  for (const obj in objectsToOmitFromCounting) {
    batchableObjects.delete(obj);
  }
  let batchableRecordCount = 0;
  for (const object of batchableObjects.values()) {
    batchableRecordCount += object ?? 0;
  }

  const views = await executeWithRetry(() => findViews(sourceWorkspace));
  const navigationMenuItems = await executeWithRetry(() => findNavigationMenuItems(sourceWorkspace));
  const skills = await executeWithRetry(() => findSkills(sourceWorkspace));
  const webhooks = await executeWithRetry(() => findWebhooks(sourceWorkspace));
  const roles = await executeWithRetry(() => findRoles(sourceWorkspace));
  const recordPageLayouts = await executeWithRetry(() => findPageLayouts(sourceWorkspace, 'RECORD_PAGE'));

  const dashboardCount = recordCountsByNamePlural.get('dashboards') ?? 0;
  const attachmentCount = recordCountsByNamePlural.get('attachments') ?? 0;
  const customSkillCount = skills.filter((skill) => skill.isCustom).length;
  const customRecordPageLayoutCount = recordPageLayouts.filter((layout) => !layout.isSystemSideEffect).length;

  // The INDEX view ("All X") is auto-provisioned per object as a side effect of object
  // creation in the target workspace - migrateViews skips it, so it shouldn't be counted here.
  const customViews = views.filter((view) => view.key !== 'INDEX');

  const otherRecordCount = countViewRequests(customViews)
    + navigationMenuItems.length
    + customSkillCount
    + webhooks.length
    + countRoleRequests(roles)
    + dashboardCount * REQUESTS_PER_DASHBOARD
    + customRecordPageLayoutCount * REQUESTS_PER_RECORD_PAGE_LAYOUT
    + attachmentCount * REQUESTS_PER_ATTACHMENT;

  const batchableMinutes = Math.ceil(batchableRecordCount / (PAGE_SIZE * migrationState.maxRequests));
  const otherMinutes = Math.ceil(otherRecordCount / migrationState.maxRequests);

  return {
    batchableRecordCount,
    otherRecordCount,
    estimatedMinutes: batchableMinutes + otherMinutes,
  };
};
