import { type DraftPageLayout } from '@/page-layout/types/DraftPageLayout';
import { isWidgetConfigurationOfTypeGraph } from '@/side-panel/pages/page-layout/utils/isWidgetConfigurationOfTypeGraph';
import { type DashboardFilterBinding } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

// A binding whose field was deleted or deactivated would be rejected on save,
// so it is dropped the way deleted chart filter fields are
export const sanitizeDashboardFilterBindingsInPageLayoutDraft = ({
  pageLayoutDraft,
  validFieldMetadataIdsByObjectMetadataId,
}: {
  pageLayoutDraft: DraftPageLayout;
  validFieldMetadataIdsByObjectMetadataId: Map<string, Set<string>>;
}): DraftPageLayout => {
  return {
    ...pageLayoutDraft,
    tabs: pageLayoutDraft.tabs.map((tab) => ({
      ...tab,
      widgets: tab.widgets.map((widget) => {
        if (!isWidgetConfigurationOfTypeGraph(widget.configuration)) {
          return widget;
        }

        const dashboardFilterBindings = widget.configuration
          .dashboardFilterBindings as
          | Record<string, DashboardFilterBinding | null>
          | null
          | undefined;

        if (!isDefined(dashboardFilterBindings)) {
          return widget;
        }

        const validFieldMetadataIds = isDefined(widget.objectMetadataId)
          ? validFieldMetadataIdsByObjectMetadataId.get(widget.objectMetadataId)
          : undefined;

        if (!isDefined(validFieldMetadataIds)) {
          return widget;
        }

        const sanitizedDashboardFilterBindings = Object.fromEntries(
          Object.entries(dashboardFilterBindings).filter(
            ([, binding]) =>
              // null is an explicit opt-out and never references a field
              !isDefined(binding) ||
              validFieldMetadataIds.has(binding.fieldMetadataId),
          ),
        );

        return {
          ...widget,
          configuration: {
            ...widget.configuration,
            dashboardFilterBindings: sanitizedDashboardFilterBindings,
          },
        };
      }),
    })),
  };
};
