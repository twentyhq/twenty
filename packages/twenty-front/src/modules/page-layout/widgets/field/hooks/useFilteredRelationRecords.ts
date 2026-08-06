import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { isRecordMatchingFilter } from '@/object-record/record-filter/utils/isRecordMatchingFilter';
import { useCurrentWidget } from '@/page-layout/widgets/hooks/useCurrentWidget';
import { useRecordTableWidgetViewForDisplay } from '@/page-layout/widgets/record-table/hooks/useRecordTableWidgetViewForDisplay';
import { usePageLayoutIdFromContextStore } from '@/side-panel/pages/page-layout/hooks/usePageLayoutIdFromContextStore';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { type ViewFilter } from '@/views/types/ViewFilter';
import { mapViewFilterGroupsToRecordFilterGroups } from '@/views/utils/mapViewFilterGroupsToRecordFilterGroups';
import { mapViewFiltersToFilters } from '@/views/utils/mapViewFiltersToFilters';
import { computeRecordGqlOperationFilter, isDefined } from 'twenty-shared/utils';

type UseFilteredRelationRecordsArgs = {
  records: any[];
  targetObjectMetadataId?: string;
};

export const useFilteredRelationRecords = ({
  records,
  targetObjectMetadataId,
}: UseFilteredRelationRecordsArgs): any[] => {
  const widget = useCurrentWidget();
  const pageLayoutId = usePageLayoutIdFromContextStore();
  const targetRecord = useTargetRecord();

  const viewId = widget?.configuration?.viewId ?? '';

  const { view } = useRecordTableWidgetViewForDisplay({
    viewId,
    widgetId: widget?.id ?? '',
    pageLayoutId,
  });

  const { objectMetadataItem } = useObjectMetadataItemById({
    objectId: targetObjectMetadataId ?? '',
  });

  if (
    !isDefined(view) ||
    !isDefined(objectMetadataItem) ||
    !Array.isArray(view.viewFilters) ||
    view.viewFilters.length === 0 ||
    !Array.isArray(records) ||
    records.length === 0
  ) {
    return records;
  }

  // Filter out the automatic relation parent filter ({ isCurrentRecordSelected: true })
  const userViewFilters = view.viewFilters.filter((vf: ViewFilter) => {
    try {
      if (!vf.value) return true;
      const parsed = JSON.parse(vf.value);
      return !parsed.isCurrentRecordSelected;
    } catch {
      return true;
    }
  });

  if (userViewFilters.length === 0) {
    return records;
  }

  const recordFilters = mapViewFiltersToFilters(
    userViewFilters,
    objectMetadataItem.fields,
  );

  const recordFilterGroups = mapViewFilterGroupsToRecordFilterGroups(
    view.viewFilterGroups ?? [],
  );

  const gqlOperationFilter = computeRecordGqlOperationFilter({
    fieldMetadataItems: objectMetadataItem.fields,
    recordFilters,
    recordFilterGroups,
    filterValueDependencies: {
      currentRecord: {
        id: targetRecord.id,
        objectMetadataNameSingular: targetRecord.targetObjectNameSingular,
      },
    },
  });

  if (
    !isDefined(gqlOperationFilter) ||
    Object.keys(gqlOperationFilter).length === 0
  ) {
    return records;
  }

  return records.filter((record) =>
    isRecordMatchingFilter({
      record,
      filter: gqlOperationFilter,
      objectMetadataItem,
    }),
  );
};
