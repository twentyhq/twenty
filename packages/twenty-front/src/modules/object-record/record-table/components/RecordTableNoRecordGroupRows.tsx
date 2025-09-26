import { RecordTableNoRecordGroupAddNew } from '@/object-record/record-table/components/RecordTableNoRecordGroupAddNew';
import { RecordTableBodyDroppablePlaceholder } from '@/object-record/record-table/record-table-body/components/RecordTableBodyDroppablePlaceholder';
import { RecordTableRowVirtualized } from '@/object-record/record-table/virtualization/components/RecordTableRowVirtualized';
import { RecordTableVirtualizedBodyPlaceholder } from '@/object-record/record-table/virtualization/components/RecordTableVirtualizedBodyPlaceholder';
import { RecordTableVirtualizedDataLoaderEffect } from '@/object-record/record-table/virtualization/components/RecordTableVirtualizedDataLoaderEffect';
import { NUMBER_OF_VIRTUALIZED_ROWS } from '@/object-record/record-table/virtualization/constants/NumberOfVirtualizedRows';
import { totalNumberOfRecordsToVirtualizeComponentState } from '@/object-record/record-table/virtualization/states/totalNumberOfRecordsToVirtualizeComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { getRange, isDefined } from 'twenty-shared/utils';

export const RecordTableNoRecordGroupRows = () => {
  const totalNumberOfRecordsToVirtualize = useRecoilComponentValue(
    totalNumberOfRecordsToVirtualizeComponentState,
  );

  const numberOfRows = isDefined(totalNumberOfRecordsToVirtualize)
    ? Math.min(totalNumberOfRecordsToVirtualize, NUMBER_OF_VIRTUALIZED_ROWS)
    : 0;

  const virtualRowIndexes = getRange(0, numberOfRows);

  return (
    <>
      <RecordTableVirtualizedBodyPlaceholder />
      {virtualRowIndexes.map((virtualRowIndex) => {
        return (
          <RecordTableRowVirtualized
            key={virtualRowIndex}
            virtualIndex={virtualRowIndex}
          />
        );
      })}
      <RecordTableVirtualizedDataLoaderEffect />
      <RecordTableBodyDroppablePlaceholder />
      <RecordTableNoRecordGroupAddNew />
    </>
  );
};
