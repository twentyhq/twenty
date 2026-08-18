import type { PageLayoutTab } from "src/logic-functions/types/dashboard.type";
import { remapWidgetConfiguration } from "src/logic-functions/utils/remap-widget-configuration.util";

export const buildPageLayoutTabsInput = (
  sourceTabs: PageLayoutTab[],
  targetObjectIdBySourceObjectId: Map<string, string>,
  targetFieldIdBySourceFieldId: Map<string, string>,
  warningContext: string,
): Record<string, unknown>[] => {
  return sourceTabs.map((tab) => {
    const targetTabId = crypto.randomUUID();

    const widgets = tab.widgets.flatMap((widget) => {
      if (widget.type === 'VIEW') {
        console.warn(`Skipping widget "${widget.title}" on ${warningContext}: VIEW-type widgets aren't supported by the API yet`);
        return [];
      }

      const targetObjectMetadataId = widget.objectMetadataId !== null
        ? targetObjectIdBySourceObjectId.get(widget.objectMetadataId)
        : undefined;
      if (widget.objectMetadataId !== null && targetObjectMetadataId === undefined) {
        console.warn(`Skipping widget "${widget.title}" on ${warningContext}: target object not found for object ${widget.objectMetadataId}`);
        return [];
      }

      return [{
        id: crypto.randomUUID(),
        pageLayoutTabId: targetTabId,
        title: widget.title,
        type: widget.type,
        objectMetadataId: targetObjectMetadataId ?? null,
        gridPosition: widget.gridPosition,
        configuration: remapWidgetConfiguration(widget.configuration, targetFieldIdBySourceFieldId),
      }];
    });

    return {
      id: targetTabId,
      title: tab.title,
      position: tab.position,
      layoutMode: tab.layoutMode,
      widgets,
    };
  });
};