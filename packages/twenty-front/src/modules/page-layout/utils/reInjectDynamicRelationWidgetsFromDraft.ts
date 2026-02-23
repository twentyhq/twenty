import { type DraftPageLayout } from '@/page-layout/types/DraftPageLayout';
import { type PageLayout } from '@/page-layout/types/PageLayout';
import { isDynamicRelationWidget } from '@/page-layout/utils/isDynamicRelationWidget';
import { WidgetType } from '~/generated-metadata/graphql';

export const reInjectDynamicRelationWidgetsFromDraft = (
  serverLayout: PageLayout,
  previousDraft: DraftPageLayout,
): PageLayout => {
  const dynamicWidgetsByTabId = new Map(
    previousDraft.tabs.map((tab) => [
      tab.id,
      tab.widgets.filter(isDynamicRelationWidget),
    ]),
  );

  const hasDynamicWidgets = [...dynamicWidgetsByTabId.values()].some(
    (widgets) => widgets.length > 0,
  );

  if (!hasDynamicWidgets) {
    return serverLayout;
  }

  return {
    ...serverLayout,
    tabs: serverLayout.tabs.map((tab) => {
      const relationWidgets = dynamicWidgetsByTabId.get(tab.id);

      if (!relationWidgets || relationWidgets.length === 0) {
        return tab;
      }

      const firstFieldsWidgetIndex = tab.widgets.findIndex(
        (widget) => widget.type === WidgetType.FIELDS,
      );

      if (firstFieldsWidgetIndex === -1) {
        return {
          ...tab,
          widgets: [...tab.widgets, ...relationWidgets],
        };
      }

      const widgetsBefore = tab.widgets.slice(0, firstFieldsWidgetIndex + 1);
      const widgetsAfter = tab.widgets.slice(firstFieldsWidgetIndex + 1);

      return {
        ...tab,
        widgets: [...widgetsBefore, ...relationWidgets, ...widgetsAfter],
      };
    }),
  };
};
