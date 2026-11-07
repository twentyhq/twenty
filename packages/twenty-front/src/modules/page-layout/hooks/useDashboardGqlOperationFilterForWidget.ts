import { objectMetadataItemsByIdMapSelector } from '@/object-metadata/states/objectMetadataItemsByIdMapSelector';
import { useFilterValueDependencies } from '@/object-record/record-filter/hooks/useFilterValueDependencies';
import { useDashboardFilterForWidget } from '@/page-layout/hooks/useDashboardFilterForWidget';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useMemo } from 'react';
import { type RecordGqlOperationFilter } from 'twenty-shared/types';
import {
  computeRecordGqlOperationFilter,
  isDefined,
  isNonEmptyArray,
} from 'twenty-shared/utils';

const NO_DASHBOARD_GQL_OPERATION_FILTER: RecordGqlOperationFilter = {};

export const useDashboardGqlOperationFilterForWidget = (
  widget: Pick<PageLayoutWidget, 'objectMetadataId' | 'configuration'>,
): RecordGqlOperationFilter => {
  const { recordFilters } = useDashboardFilterForWidget(widget);
  const objectMetadataItemsByIdMap = useAtomStateValue(
    objectMetadataItemsByIdMapSelector,
  );
  const { filterValueDependencies } = useFilterValueDependencies();

  const fields = isDefined(widget.objectMetadataId)
    ? objectMetadataItemsByIdMap.get(widget.objectMetadataId)?.fields
    : undefined;

  return useMemo(
    () =>
      isNonEmptyArray(recordFilters)
        ? computeRecordGqlOperationFilter({
            fieldMetadataItems: fields ?? [],
            filterValueDependencies,
            recordFilters,
            recordFilterGroups: [],
          })
        : NO_DASHBOARD_GQL_OPERATION_FILTER,
    [recordFilters, fields, filterValueDependencies],
  );
};
