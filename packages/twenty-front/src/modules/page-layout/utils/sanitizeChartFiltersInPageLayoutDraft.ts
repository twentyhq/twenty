import { type DraftPageLayout } from '@/page-layout/types/DraftPageLayout';
import { type ChartFilters } from '@/side-panel/pages/page-layout/types/ChartFilters';
import { dropChartRecordFiltersWithDeletedFields } from '@/side-panel/pages/page-layout/utils/dropChartRecordFiltersWithDeletedFields';
import { isWidgetConfigurationOfTypeGraph } from '@/side-panel/pages/page-layout/utils/isWidgetConfigurationOfTypeGraph';
import { isDefined } from 'twenty-shared/utils';

export const sanitizeChartFiltersInPageLayoutDraft = ({
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

        const chartFilters = widget.configuration.filter as
          | ChartFilters
          | null
          | undefined;

        if (!isDefined(chartFilters)) {
          return widget;
        }

        const validFieldMetadataIds = isDefined(widget.objectMetadataId)
          ? validFieldMetadataIdsByObjectMetadataId.get(widget.objectMetadataId)
          : undefined;

        if (!isDefined(validFieldMetadataIds)) {
          return widget;
        }

        const sanitizedChartFilters = dropChartRecordFiltersWithDeletedFields({
          chartFilters,
          validFieldMetadataIds,
        });

        return {
          ...widget,
          configuration: {
            ...widget.configuration,
            filter: sanitizedChartFilters,
          },
        };
      }),
    })),
  };
};
