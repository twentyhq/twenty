import { type DraftPageLayout } from '@/page-layout/types/DraftPageLayout';
import { getDashboardFilterBindingsWithWidgetSetting } from '@/page-layout/utils/getDashboardFilterBindingsWithWidgetSetting';
import { getWidgetDashboardFilterBindings } from '@/page-layout/utils/getWidgetDashboardFilterBindings';

export const setDashboardFilterWidgetSettingInDraft = ({
  pageLayoutDraft,
  widgetId,
  pageLayoutFilterId,
  value,
}: {
  pageLayoutDraft: DraftPageLayout;
  widgetId: string;
  pageLayoutFilterId: string;
  value: string;
}): DraftPageLayout => ({
  ...pageLayoutDraft,
  tabs: pageLayoutDraft.tabs.map((tab) => ({
    ...tab,
    widgets: tab.widgets.map((widget) =>
      widget.id === widgetId
        ? {
            ...widget,
            configuration: {
              ...widget.configuration,
              dashboardFilterBindings:
                getDashboardFilterBindingsWithWidgetSetting({
                  dashboardFilterBindings: getWidgetDashboardFilterBindings(
                    widget.configuration,
                  ),
                  pageLayoutFilterId,
                  value,
                }),
            },
          }
        : widget,
    ),
  })),
});
