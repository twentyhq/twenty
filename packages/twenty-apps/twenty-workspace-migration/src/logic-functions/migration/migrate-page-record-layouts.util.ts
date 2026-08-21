import type { AxiosInstance } from "axios";
import type { PageLayout, PageLayoutWidget } from "src/logic-functions/types/dashboard.type";
import { findPageLayouts } from "src/logic-functions/requests/find-page-layouts.util";
import { executeWithRetryAndCheckpoint } from "src/logic-functions/utils/execute-with-retry-and-checkpoint.util";
import { createMetadataEntity } from "src/logic-functions/requests/create-metadata-entity.util";
import { applyPageLayoutTabsAndWidgets } from "src/logic-functions/utils/apply-page-layout-tabs-and-widgets.util";
import { remapWidgetConfiguration } from "src/logic-functions/utils/remap-widget-configuration.util";
import { logger } from "src/logic-functions/utils/logger.util";

const createCustomWidget = async (
  targetWorkspace: AxiosInstance,
  targetTabId: string,
  widget: PageLayoutWidget,
  targetObjectIdBySourceObjectId: Map<string, string>,
  targetFieldIdBySourceFieldId: Map<string, string>,
  warningContext: string,
): Promise<boolean> => {
  if (widget.type === 'VIEW') {
    logger.warn(`Skipping widget "${widget.title}" on ${warningContext}: VIEW-type widgets aren't supported by the API yet`);
    return false;
  }

  const targetObjectMetadataId = widget.objectMetadataId !== null
    ? targetObjectIdBySourceObjectId.get(widget.objectMetadataId)
    : null;
  if (widget.objectMetadataId !== null && targetObjectMetadataId === undefined) {
    logger.warn(`Skipping widget "${widget.title}" on ${warningContext}: target object not found for object ${widget.objectMetadataId}`);
    return false;
  }

  await executeWithRetryAndCheckpoint(() => createMetadataEntity(targetWorkspace, 'createPageLayoutWidget', 'input', 'CreatePageLayoutWidgetInput', {
    pageLayoutTabId: targetTabId,
    title: widget.title,
    type: widget.type,
    objectMetadataId: targetObjectMetadataId ?? null,
    gridPosition: widget.gridPosition,
    configuration: remapWidgetConfiguration(widget.configuration, targetFieldIdBySourceFieldId),
  }));
  return true;
};

// The system layout keeps updatePageLayoutWithTabsAndWidgets (a full tree replace - anything
// existing left out of the call gets deleted) off the table entirely: it already has its own 5
// tabs/widgets under different, server-generated ids, so replaying it there would delete them.
// Everything below is additive-only (createPageLayoutTab / createPageLayoutWidget), which is
// what makes it safe to point at a layout the target already owns and is actively using.
const migrateSystemLayoutCustomization = async (
  targetWorkspace: AxiosInstance,
  sourceLayout: PageLayout,
  targetLayout: PageLayout,
  targetObjectIdBySourceObjectId: Map<string, string>,
  targetFieldIdBySourceFieldId: Map<string, string>,
): Promise<number> => {
  const warningContext = `default record page layout for object ${sourceLayout.objectMetadataId}`;
  let createdCount = 0;

  // A system tab's own system widget (there's exactly one, from the fixed default-record-page
  // template: home/timeline/tasks/notes/files) identifies *which* default tab it is - unlike
  // the tab's title, it can't have been renamed by a user, so it's what ties a source system
  // tab to its target counterpart across workspaces where the tabs' own ids never match.
  const targetSystemTabIdByWidgetType = new Map(
    targetLayout.tabs.flatMap((tab) =>
      tab.widgets.filter((widget) => widget.isSystemSideEffect).map((widget) => [widget.type, tab.id] as const),
    ),
  );
  const existingCustomTabTitles = new Set(
    targetLayout.tabs.filter((tab) => !tab.isSystemSideEffect).map((tab) => tab.title),
  );
  const existingCustomWidgetKeys = new Set(
    targetLayout.tabs.flatMap((tab) =>
      tab.widgets.filter((widget) => !widget.isSystemSideEffect).map((widget) => `${tab.id}::${widget.title}::${widget.type}`),
    ),
  );

  for (const sourceTab of sourceLayout.tabs) {
    if (!sourceTab.isSystemSideEffect) {
      // A whole extra tab a user added directly on the default page (as opposed to a widget on
      // one of the 5 system tabs) - dedup by title, the best available signal without a shared
      // id space between workspaces.
      if (existingCustomTabTitles.has(sourceTab.title)) {
        continue;
      }
      try {
        const createdTab = await executeWithRetryAndCheckpoint(() => createMetadataEntity(targetWorkspace, 'createPageLayoutTab', 'input', 'CreatePageLayoutTabInput', {
          title: sourceTab.title,
          position: sourceTab.position,
          pageLayoutId: targetLayout.id,
          layoutMode: sourceTab.layoutMode,
        }));
        for (const widget of sourceTab.widgets) {
          await createCustomWidget(targetWorkspace, createdTab.id, widget, targetObjectIdBySourceObjectId, targetFieldIdBySourceFieldId, warningContext);
        }
        createdCount += 1;
      } catch (error) {
        logger.warn(`Skipping tab "${sourceTab.title}" on ${warningContext}: ${error instanceof Error ? error.message : String(error)}`);
      }
      continue;
    }

    // A system tab - only widgets a user added on top of its single default one are ours to
    // migrate; the default widget itself already exists identically on the target's own copy.
    const customWidgets = sourceTab.widgets.filter((widget) => !widget.isSystemSideEffect);
    if (customWidgets.length === 0) {
      continue;
    }

    const sourceSystemWidgetType = sourceTab.widgets.find((widget) => widget.isSystemSideEffect)?.type;
    const targetTabId = sourceSystemWidgetType !== undefined
      ? targetSystemTabIdByWidgetType.get(sourceSystemWidgetType)
      : undefined;
    if (targetTabId === undefined) {
      logger.warn(`Skipping ${customWidgets.length} widget(s) on "${sourceTab.title}" for ${warningContext}: no matching system tab found on the target`);
      continue;
    }

    for (const widget of customWidgets) {
      const widgetKey = `${targetTabId}::${widget.title}::${widget.type}`;
      if (existingCustomWidgetKeys.has(widgetKey)) {
        continue;
      }
      try {
        const created = await createCustomWidget(targetWorkspace, targetTabId, widget, targetObjectIdBySourceObjectId, targetFieldIdBySourceFieldId, warningContext);
        if (created) {
          existingCustomWidgetKeys.add(widgetKey);
          createdCount += 1;
        }
      } catch (error) {
        logger.warn(`Skipping widget "${widget.title}" on ${warningContext}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }

  return createdCount;
};

export const migrateRecordPageLayouts = async (
  sourceWorkspace: AxiosInstance,
  targetWorkspace: AxiosInstance,
  targetObjectIdBySourceObjectId: Map<string, string>,
  targetFieldIdBySourceFieldId: Map<string, string>,
) => {
  const sourcePageLayouts = await findPageLayouts(sourceWorkspace, 'RECORD_PAGE');
  const targetPageLayouts = await findPageLayouts(targetWorkspace, 'RECORD_PAGE');

  let createdCount = 0;

  // Every object gets an auto-provisioned system RECORD_PAGE layout for free the moment the
  // object itself is created, with 5 fixed tabs (home/timeline/tasks/notes/files) built from
  // the same template in every workspace - migrating it again would duplicate it, since its id
  // is server-generated independently in each workspace. A genuinely separate custom layout
  // has none of that baggage (nothing pre-exists on the target to collide with), so it's still
  // created wholesale.
  const customLayouts = sourcePageLayouts.filter((layout) => !layout.isSystemSideEffect);
  const existingCustomLayoutKeys = new Set(
    targetPageLayouts
    .filter((layout) => !layout.isSystemSideEffect)
    .map((layout) => `${layout.objectMetadataId}::${layout.name}`),
  );

  for (const sourceLayout of customLayouts) {
    const targetObjectMetadataId = sourceLayout.objectMetadataId !== null
      ? targetObjectIdBySourceObjectId.get(sourceLayout.objectMetadataId)
      : undefined;
    if (targetObjectMetadataId === undefined) {
      logger.warn(`Skipping record page layout "${sourceLayout.name}": target object not found for object ${sourceLayout.objectMetadataId}`);
      continue;
    }

    if (existingCustomLayoutKeys.has(`${targetObjectMetadataId}::${sourceLayout.name}`)) {
      continue;
    }

    try {
      const createdPageLayout = await executeWithRetryAndCheckpoint(() => createMetadataEntity(targetWorkspace, 'createPageLayout', 'input', 'CreatePageLayoutInput', {
        name: sourceLayout.name,
        type: sourceLayout.type,
        objectMetadataId: targetObjectMetadataId,
      }));

      await applyPageLayoutTabsAndWidgets(
        targetWorkspace,
        createdPageLayout.id,
        sourceLayout.tabs,
        targetObjectIdBySourceObjectId,
        targetFieldIdBySourceFieldId,
        `record page layout "${sourceLayout.name}"`,
      );
      createdCount += 1;
    } catch (error) {
      logger.warn(`Skipping record page layout "${sourceLayout.name}": ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // isSystemSideEffect only ever gets set on a *new* tab/widget a user adds - it's never
  // flipped back off on the layout itself - so the common case (adding a widget straight onto
  // an object's default page, rather than building a whole separate custom layout) still needs
  // migrating; it's just additive onto the target's existing system layout instead.
  const targetSystemLayoutByObjectMetadataId = new Map(
    targetPageLayouts.filter((layout) => layout.isSystemSideEffect).map((layout) => [layout.objectMetadataId, layout]),
  );

  for (const sourceLayout of sourcePageLayouts.filter((layout) => layout.isSystemSideEffect)) {
    const targetObjectMetadataId = sourceLayout.objectMetadataId !== null
      ? targetObjectIdBySourceObjectId.get(sourceLayout.objectMetadataId)
      : undefined;
    if (targetObjectMetadataId === undefined) {
      continue;
    }

    const targetLayout = targetSystemLayoutByObjectMetadataId.get(targetObjectMetadataId);
    if (targetLayout === undefined) {
      logger.warn(`Skipping default record page customization for object ${sourceLayout.objectMetadataId}: target object has no system RECORD_PAGE layout`);
      continue;
    }

    createdCount += await migrateSystemLayoutCustomization(
      targetWorkspace,
      sourceLayout,
      targetLayout,
      targetObjectIdBySourceObjectId,
      targetFieldIdBySourceFieldId,
    );
  }

  logger.log(`Record page layouts: created ${createdCount}`);
};
