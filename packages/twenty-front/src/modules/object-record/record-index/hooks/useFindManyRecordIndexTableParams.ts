import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { turnSortsIntoOrderBy } from '@/object-record/object-sort-dropdown/utils/turnSortsIntoOrderBy';
import { computeViewRecordGqlOperationFilter } from '@/object-record/record-filter/utils/computeViewRecordGqlOperationFilter';
import { useCurrentRecordGroupDefinition } from '@/object-record/record-group/hooks/useCurrentRecordGroupDefinition';
import { tableFiltersComponentState } from '@/object-record/record-table/states/tableFiltersComponentState';
import { tableSortsComponentState } from '@/object-record/record-table/states/tableSortsComponentState';
import { tableViewFilterGroupsComponentState } from '@/object-record/record-table/states/tableViewFilterGroupsComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useMemo } from 'react';
import { isDefined } from 'twenty-ui';

export const useFindManyRecordIndexTableParams = (
  objectNameSingular: string,
  recordTableId?: string,
) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const currentRecordGroupDefinition = useCurrentRecordGroupDefinition();

  const tableViewFilterGroups = useRecoilComponentValueV2(
    tableViewFilterGroupsComponentState,
    recordTableId,
  );
  const tableFilters = useRecoilComponentValueV2(
    tableFiltersComponentState,
    recordTableId,
  );
  const tableSorts = useRecoilComponentValueV2(
    tableSortsComponentState,
    recordTableId,
  );

  const stateFilter = computeViewRecordGqlOperationFilter(
    tableFilters,
    objectMetadataItem?.fields ?? [],
    tableViewFilterGroups,
  );

  const recordGroupFilter = useMemo(() => {
    if (isDefined(currentRecordGroupDefinition)) {
      const fieldMetadataItem = objectMetadataItem?.fields.find(
        (fieldMetadataItem) =>
          fieldMetadataItem.id === currentRecordGroupDefinition.fieldMetadataId,
      );

      if (!fieldMetadataItem) {
        throw new Error(
          `Field metadata item with id ${currentRecordGroupDefinition.fieldMetadataId} not found`,
        );
      }

      if (!isDefined(currentRecordGroupDefinition.value)) {
        return { [fieldMetadataItem.name]: { is: 'NULL' } };
      }

      return {
        [fieldMetadataItem.name]: {
          eq: currentRecordGroupDefinition.value,
        },
      };
    }

    return {};
  }, [objectMetadataItem.fields, currentRecordGroupDefinition]);

  const orderBy = turnSortsIntoOrderBy(objectMetadataItem, tableSorts);

  return {
    objectNameSingular,
    filter: {
      ...stateFilter,
      ...recordGroupFilter,
    },
    orderBy,
    // If we have a current record group definition, we only want to fetch 8 records by page
    ...(currentRecordGroupDefinition ? { limit: 8 } : {}),
  };
};
