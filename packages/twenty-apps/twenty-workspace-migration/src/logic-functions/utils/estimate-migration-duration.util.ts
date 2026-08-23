import { type AxiosInstance } from "axios";
import { findObjectRecordCounts } from "src/logic-functions/requests/find-object-record-counts.util";
import { findViews } from "src/logic-functions/requests/find-views.util";
import { findNavigationMenuItems } from "src/logic-functions/requests/find-navigation-menu-items.util";
import { findSkills } from "src/logic-functions/requests/find-skills.util";
import { findWebhooks } from "src/logic-functions/requests/find-webhooks.util";
import { findRoles } from "src/logic-functions/requests/find-roles.util";
import { findPageLayouts } from "src/logic-functions/requests/find-page-layouts.util";
import { PAGE_SIZE } from "src/constants/page-size";
import { migrationState, setStateRef } from "src/logic-functions/utils/migration-state.util";
import { Role } from "src/logic-functions/types/role.type";
import { View } from "src/logic-functions/types/view-entities.type";
import { NavigationMenuItem } from "src/logic-functions/types/navigation-menu-item.type";
import { executeWithRetry } from "src/logic-functions/utils/execute-with-retry.util";
import { objectsToOmitFromCounting } from "src/constants/to-omit";

export type MigrationDurationEstimate = {
  batchableRecordCount: number;
  otherRecordCount: number;
  estimatedMinutes: number;
};

// Exported so the migrators that actually consume this budget in stages 4-8 can bring the
// live estimate down by exactly what they were charged for, instead of it staying frozen at
// the stage1 snapshot.
export const REQUESTS_PER_DASHBOARD = 3; // createPageLayout + updatePageLayoutWithTabsAndWidgets + createManyRecords(1)
export const REQUESTS_PER_RECORD_PAGE_LAYOUT = 2; // createPageLayout + updatePageLayoutWithTabsAndWidgets
export const REQUESTS_PER_ATTACHMENT = 4; // download + createFileUpload + upload PUT + completeFileUpload

export const countViewRequests = (views: View[]): number =>
  views.reduce(
    (sum, view) =>
      sum
      + 1 // createView
      + (view.viewFieldGroups.length > 0 ? 1 : 0)
      + (view.viewFields.length > 0 ? 1 : 0)
      + (view.viewGroups.length > 0 ? 1 : 0)
      + view.viewFilterGroups.length
      + view.viewFilters.length
      + view.viewSorts.length,
    0,
  );

const countNavigationMenuItemRequests = (items: NavigationMenuItem[]): number => {
  const itemById = new Map(items.map((item) => [item.id, item]));
  const getDepth = (item: NavigationMenuItem): number => {
    let depth = 1;
    let parent = item.folderId !== null ? itemById.get(item.folderId) : undefined;
    while (parent !== undefined) {
      depth += 1;
      parent = parent.folderId !== null ? itemById.get(parent.folderId) : undefined;
    }
    return depth;
  };

  return items.reduce((deepest, item) => Math.max(deepest, getDepth(item)), 0);
};

export const countRoleRequests = (roles: Role[]): number =>
  roles.reduce(
    (sum, role) =>
      sum
      + 1 // createOneRole
      + (role.permissionFlags.length > 0 ? 1 : 0)
      + (role.objectPermissions.length > 0 ? 1 : 0)
      + (role.fieldPermissions.length > 0 ? 1 : 0),
    0,
  );

export const computeEstimatedMinutes = (batchableRecordCount: number, otherRecordCount: number): number =>
  Math.ceil(batchableRecordCount / (PAGE_SIZE * migrationState.maxRequests))
  + Math.ceil(otherRecordCount / migrationState.maxRequests);

export const decrementEstimate = (consumed: { batchableRecordCount?: number; otherRecordCount?: number }): void => {
  const current = migrationState.estimate;
  if (current === null) {
    return;
  }

  const batchableRecordCount = Math.max(0, current.batchableRecordCount - (consumed.batchableRecordCount ?? 0));
  const otherRecordCount = Math.max(0, current.otherRecordCount - (consumed.otherRecordCount ?? 0));

  setStateRef('estimate', {
    batchableRecordCount,
    otherRecordCount,
    estimatedMinutes: computeEstimatedMinutes(batchableRecordCount, otherRecordCount),
  });
};

export const estimateMigrationDuration = async (
  sourceWorkspace: AxiosInstance,
): Promise<MigrationDurationEstimate> => {
  const recordCountsByNamePlural = await executeWithRetry(() => findObjectRecordCounts(sourceWorkspace));
  const dashboardCount = recordCountsByNamePlural.get('dashboards') ?? 0;
  const attachmentCount = recordCountsByNamePlural.get('attachments') ?? 0;
  for (const obj of objectsToOmitFromCounting) {
    recordCountsByNamePlural.delete(obj);
  }
  let batchableRecordCount = 0;
  for (const object of recordCountsByNamePlural.values()) {
    batchableRecordCount += object ?? 0;
  }

  const views = await executeWithRetry(() => findViews(sourceWorkspace));
  const navigationMenuItems = await executeWithRetry(() => findNavigationMenuItems(sourceWorkspace));
  const skills = await executeWithRetry(() => findSkills(sourceWorkspace));
  const webhooks = await executeWithRetry(() => findWebhooks(sourceWorkspace));
  const roles = await executeWithRetry(() => findRoles(sourceWorkspace));
  const recordPageLayouts = await executeWithRetry(() => findPageLayouts(sourceWorkspace, 'RECORD_PAGE'));

  const customSkillCount = skills.filter((skill) => skill.isCustom).length;
  const customRecordPageLayoutCount = recordPageLayouts.filter((layout) => !layout.isSystemSideEffect).length;

  // The INDEX view ("All X") is auto-provisioned per object as a side effect of object
  // creation in the target workspace - migrateViews skips it, so it shouldn't be counted here.
  const customViews = views.filter((view) => view.key !== 'INDEX');

  const otherRecordCount = countViewRequests(customViews)
    + countNavigationMenuItemRequests(navigationMenuItems)
    + customSkillCount
    + webhooks.length
    + countRoleRequests(roles)
    + dashboardCount * REQUESTS_PER_DASHBOARD
    + customRecordPageLayoutCount * REQUESTS_PER_RECORD_PAGE_LAYOUT
    + attachmentCount * REQUESTS_PER_ATTACHMENT;

  return {
    batchableRecordCount,
    otherRecordCount,
    estimatedMinutes: computeEstimatedMinutes(batchableRecordCount, otherRecordCount),
  };
};
