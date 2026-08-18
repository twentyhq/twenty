import type { AxiosInstance } from "axios";
import { findManyRecords } from "src/logic-functions/requests/find-many-records.util";
import { findPageLayouts } from "src/logic-functions/requests/find-page-layouts.util";
import { executeWithRetryAndCheckpoint } from "src/logic-functions/utils/execute-with-retry-and-checkpoint.util";
import { createMetadataEntity } from "src/logic-functions/requests/create-metadata-entity.util";
import { createManyRecords } from "src/logic-functions/requests/create-many-records.util";
import { applyPageLayoutTabsAndWidgets } from "src/logic-functions/utils/apply-page-layout-tabs-and-widgets.util";

export const migrateDashboards = async (
  sourceWorkspace: AxiosInstance,
  targetWorkspace: AxiosInstance,
  targetObjectIdBySourceObjectId: Map<string, string>,
  targetFieldIdBySourceFieldId: Map<string, string>,
) => {
  const readAllDashboards = async (client: AxiosInstance, selectionSet: string) => {
    const nodes: Record<string, unknown>[] = [];
    let after: string | null = null;
    while (true) {
      const page = await findManyRecords(client, 'dashboards', selectionSet, after);
      nodes.push(...page.edges.map((edge) => edge.node));
      if (!page.pageInfo.hasNextPage) {
        break;
      }
      after = page.pageInfo.endCursor;
    }
    return nodes;
  };

  const sourceDashboards = await readAllDashboards(sourceWorkspace, 'title\npageLayoutId\nposition');
  const targetDashboards = await readAllDashboards(targetWorkspace, 'id');
  const existingTargetDashboardIds = new Set(targetDashboards.map((node) => node.id as string));

  const sourcePageLayouts = await findPageLayouts(sourceWorkspace, 'DASHBOARD');
  const sourcePageLayoutById = new Map(sourcePageLayouts.map((layout) => [layout.id, layout]));

  let createdCount = 0;

  for (const dashboard of sourceDashboards) {
    const dashboardId = dashboard.id as string;
    const title = dashboard.title as string;

    // PageLayout has no client-settable id or natural key (unlike Dashboard itself), so
    // re-run idempotency only works one level up: if a Dashboard with the reused source id
    // already exists, its whole layout tree was already built in a prior run, and the entire
    // dashboard - not just parts of it - is skipped.
    if (existingTargetDashboardIds.has(dashboardId)) {
      continue;
    }

    const sourcePageLayout = sourcePageLayoutById.get(dashboard.pageLayoutId as string);
    if (sourcePageLayout === undefined) {
      console.warn(`Skipping dashboard "${title}": its page layout was not found`);
      continue;
    }

    try {
      const targetLayoutObjectMetadataId = sourcePageLayout.objectMetadataId !== null
        ? targetObjectIdBySourceObjectId.get(sourcePageLayout.objectMetadataId) ?? null
        : null;

      const createdPageLayout = await executeWithRetryAndCheckpoint(() => createMetadataEntity(targetWorkspace, 'createPageLayout', 'input', 'CreatePageLayoutInput', {
        name: sourcePageLayout.name,
        type: sourcePageLayout.type,
        objectMetadataId: targetLayoutObjectMetadataId,
      }));

      await applyPageLayoutTabsAndWidgets(
        targetWorkspace,
        createdPageLayout.id,
        sourcePageLayout.tabs,
        targetObjectIdBySourceObjectId,
        targetFieldIdBySourceFieldId,
        `dashboard "${title}"`,
      );

      await executeWithRetryAndCheckpoint(() => createManyRecords(targetWorkspace, 'dashboards', [{
        id: dashboardId,
        title,
        pageLayoutId: createdPageLayout.id,
        position: dashboard.position,
      }], new Set()));
      createdCount += 1;
    } catch (error) {
      // A dashboard whose layout/tab/widget tree fails to apply can't be meaningfully
      // partially migrated - skip it and move on to the rest.
      console.warn(`Skipping dashboard "${title}": ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  console.log(`Dashboards: created ${createdCount}`);
};