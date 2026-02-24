import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createComponentSelectorV2 } from '@/ui/utilities/state/jotai/utils/createComponentSelectorV2';

export const tableHasAnyFilterOrSortComponentSelector =
  createComponentSelectorV2<boolean>({
    key: 'tableHasAnyFilterOrSortComponentSelector',
    componentInstanceContext: RecordTableComponentInstanceContext,
    get:
      ({ instanceId }) =>
      ({ get }) => {
        const currentRecordFilters = get(currentRecordFiltersComponentState, {
          instanceId,
        });

        const currentRecordSorts = get(currentRecordSortsComponentState, {
          instanceId,
        });

        const tableHasAnyFilterOrSort =
          currentRecordFilters.length > 0 || currentRecordSorts.length > 0;

        return tableHasAnyFilterOrSort;
      },
  });
