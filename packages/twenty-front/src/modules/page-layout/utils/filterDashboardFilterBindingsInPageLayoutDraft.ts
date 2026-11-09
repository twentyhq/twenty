import { type DraftPageLayout } from '@/page-layout/types/DraftPageLayout';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { type DashboardFilterBinding } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const filterDashboardFilterBindingsInPageLayoutDraft = ({
  pageLayoutDraft,
  isBindingKept,
}: {
  pageLayoutDraft: DraftPageLayout;
  isBindingKept: ({
    binding,
    widget,
  }: {
    binding: Pick<DashboardFilterBinding, 'pageLayoutFilterId'> & {
      fieldMetadataId?: string | null;
    };
    widget: PageLayoutWidget;
  }) => boolean;
}): DraftPageLayout => ({
  ...pageLayoutDraft,
  tabs: pageLayoutDraft.tabs.map((tab) => ({
    ...tab,
    widgets: tab.widgets.map((widget) => {
      if (
        !('dashboardFilterBindings' in widget.configuration) ||
        !isDefined(widget.configuration.dashboardFilterBindings)
      ) {
        return widget;
      }

      const dashboardFilterBindings =
        widget.configuration.dashboardFilterBindings.filter((binding) =>
          isBindingKept({ binding, widget }),
        );

      if (
        dashboardFilterBindings.length ===
        widget.configuration.dashboardFilterBindings.length
      ) {
        return widget;
      }

      return {
        ...widget,
        configuration: { ...widget.configuration, dashboardFilterBindings },
      };
    }),
  })),
});
