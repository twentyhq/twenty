import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createAtomComponentSelector } from '@/ui/utilities/state/jotai/utils/createAtomComponentSelector';

export const tableHasAnyFilterOrSortComponentSelector =
  createAtomComponentSelector<boolean>({
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
