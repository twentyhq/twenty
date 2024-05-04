import { useContext } from 'react';

import { RecordTableRowContext } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { useSetSelectedRow } from '@/object-record/record-table/scopes/SelectedRowSelectorContext';

export const useSetCurrentRowSelected = () => {
  const { recordId } = useContext(RecordTableRowContext);

  // const { isRowSelectedFamilyState } = useRecordTableStates();

  const setSelectedRow = useSetSelectedRow();

  // const setCurrentRowSelected = useRecoilCallback(
  //   ({ set, snapshot }) =>
  //     (newSelectedState: boolean) => {
  //       const isRowSelected = getSnapshotValue(
  //         snapshot,
  //         isRowSelectedFamilyState(recordId),
  //       );

  //       if (isRowSelected !== newSelectedState) {
  //         set(isRowSelectedFamilyState(recordId), newSelectedState);
  //       }
  //     },
  //   [recordId, isRowSelectedFamilyState],
  // );

  const setCurrentRowSelected = (newSelectedState: boolean) => {
    setSelectedRow(recordId, newSelectedState);
  };

  return {
    setCurrentRowSelected,
  };
};
