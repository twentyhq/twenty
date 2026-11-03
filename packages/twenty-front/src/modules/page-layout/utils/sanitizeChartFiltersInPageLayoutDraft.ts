import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type DraftPageLayout } from '@/page-layout/types/DraftPageLayout';
import { type RecordFiltersWithGroups } from '@/object-record/record-filter/types/RecordFiltersWithGroups';
import { sanitizeRecordFilters } from '@/object-record/record-filter/utils/sanitizeRecordFilters';
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
          | RecordFiltersWithGroups
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

        const sanitizedChartFilters = sanitizeRecordFilters({
          recordFiltersWithGroups: chartFilters,
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
