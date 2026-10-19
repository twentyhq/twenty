import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { NUMBER_OF_VIRTUALIZED_ROWS } from '@/object-record/record-table/virtualization/constants/NumberOfVirtualizedRows';
import { totalNumberOfRecordsToVirtualizeComponentState } from '@/object-record/record-table/virtualization/states/totalNumberOfRecordsToVirtualizeComponentState';
import { createAtomComponentSelector } from '@/ui/utilities/state/jotai/utils/createAtomComponentSelector';

export const numberOfDisplayedVirtualRowsComponentSelector =
  createAtomComponentSelector<number>({
    key: 'numberOfDisplayedVirtualRowsComponentSelector',
    componentInstanceContext: RecordTableComponentInstanceContext,
    get:
      ({ instanceId }) =>
      ({ get }) =>
        Math.min(
          get(totalNumberOfRecordsToVirtualizeComponentState, {
            instanceId,
          }) ?? 0,
          NUMBER_OF_VIRTUALIZED_ROWS,
        ),
  });
