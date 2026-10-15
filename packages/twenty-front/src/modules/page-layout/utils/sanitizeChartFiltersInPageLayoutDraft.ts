import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type DraftPageLayout } from '@/page-layout/types/DraftPageLayout';
import { type ChartFilters } from '@/side-panel/pages/page-layout/types/ChartFilters';
import { sanitizeChartRecordFilters } from '@/side-panel/pages/page-layout/utils/sanitizeChartRecordFilters';
import { isWidgetConfigurationOfTypeGraph } from '@/side-panel/pages/page-layout/utils/isWidgetConfigurationOfTypeGraph';
import { isDefined } from 'twenty-shared/utils';

export const sanitizeChartFiltersInPageLayoutDraft = ({
  pageLayoutDraft,
  fieldMetadataItemsByObjectMetadataId,
}: {
  pageLayoutDraft: DraftPageLayout;
  fieldMetadataItemsByObjectMetadataId: Map<
    string,
    (Pick<FieldMetadataItem, 'id' | 'isActive'> & {
      morphRelations?: { sourceFieldMetadata: { id: string } }[] | null;
    })[]
  >;
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

        const fieldMetadataItems = isDefined(widget.objectMetadataId)
          ? fieldMetadataItemsByObjectMetadataId.get(widget.objectMetadataId)
          : undefined;

        if (!isDefined(fieldMetadataItems)) {
          return widget;
        }

        const sanitizedChartFilters = sanitizeChartRecordFilters({
          chartFilters,
          fieldMetadataItems,
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
