import { type DraftPageLayout } from '@/page-layout/types/DraftPageLayout';
import { isDefined } from 'twenty-shared/utils';

export const removePageLayoutFilterFromDraft = ({
  pageLayoutDraft,
  pageLayoutFilterId,
}: {
  pageLayoutDraft: DraftPageLayout;
  pageLayoutFilterId: string;
}): DraftPageLayout => ({
  ...pageLayoutDraft,
  filters: (pageLayoutDraft.filters ?? []).filter(
    ({ id }) => id !== pageLayoutFilterId,
  ),
  tabs: pageLayoutDraft.tabs.map((tab) => ({
    ...tab,
    widgets: tab.widgets.map((widget) => {
      if (
        !('dashboardFilterBindings' in widget.configuration) ||
        !isDefined(widget.configuration.dashboardFilterBindings)
      ) {
        return widget;
      }

      return {
        ...widget,
        configuration: {
          ...widget.configuration,
          dashboardFilterBindings:
            widget.configuration.dashboardFilterBindings.filter(
              (binding) => binding.pageLayoutFilterId !== pageLayoutFilterId,
            ),
        },
      };
    }),
  })),
});
