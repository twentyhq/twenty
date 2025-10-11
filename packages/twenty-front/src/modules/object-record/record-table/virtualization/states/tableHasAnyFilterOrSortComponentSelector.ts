import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createComponentSelector } from '@/ui/utilities/state/component-state/utils/createComponentSelector';

export const tableHasAnyFilterOrSortComponentSelector =
  createComponentSelector<boolean>({
    key: 'tableHasAnyFilterOrSortComponentSelector',
    componentInstanceContext: RecordTableComponentInstanceContext,
    get:
      ({ instanceId }) =>
      ({ get }) => {
        const currentRecordFilters = get(
          currentRecordFiltersComponentState.atomFamily({ instanceId }),
        );

        const currentRecordSorts = get(
          currentRecordSortsComponentState.atomFamily({ instanceId }),
        );

        const tableHasAnyFilterOrSort =
          currentRecordFilters.length > 0 || currentRecordSorts.length > 0;

        return tableHasAnyFilterOrSort;
      },
  });
