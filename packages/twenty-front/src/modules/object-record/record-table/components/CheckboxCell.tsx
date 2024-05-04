import { useCallback, useContext } from 'react';
import { useSetRecoilState } from 'recoil';

import { RecordTableRowContext } from '@/object-record/record-table/contexts/RecordTableRowContext';
import {
  useSelectedRow,
  useSetSelectedRow,
} from '@/object-record/record-table/scopes/SelectedRowSelectorContext';
import { Checkbox } from '@/ui/input/components/Checkbox';
import { actionBarOpenState } from '@/ui/navigation/action-bar/states/actionBarIsOpenState';

// const StyledContainer = styled.div`
//   align-items: center;
//   cursor: pointer;

//   display: flex;
//   height: 32px;

//   justify-content: center;
//   background-color: ${({ theme }) => theme.background.primary};
// `;

export const CheckboxCell = () => {
  const { recordId } = useContext(RecordTableRowContext);
  // const { isRowSelectedFamilyState } = useRecordTableStates();
  const setActionBarOpenState = useSetRecoilState(actionBarOpenState);
  // const { setCurrentRowSelected } = useSetCurrentRowSelected();
  // const currentRowSelected = useRecoilValue(isRowSelectedFamilyState(recordId));

  const isSelected = useSelectedRow(recordId);

  const setSelectedRow = useSetSelectedRow();

  const handleClick = useCallback(() => {
    setSelectedRow(recordId, !isSelected);
    setActionBarOpenState(true);
  }, [setActionBarOpenState, setSelectedRow, recordId, isSelected]);

  return (
    <div
      onClick={handleClick}
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '32px',
        cursor: 'pointer',
      }}
    >
      <Checkbox checked={isSelected} />
    </div>
  );
};
