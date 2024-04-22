import { useContext } from 'react';

import { useIsFieldInputOnly } from '@/object-record/record-field/hooks/useIsFieldInputOnly';
import { RecordTableContext } from '@/object-record/record-table/contexts/RecordTableContext';
import { useCurrentTableCellPosition } from '@/object-record/record-table/record-table-cell/hooks/useCurrentCellPosition';
import { useOpenRecordTableCellFromCell } from '@/object-record/record-table/record-table-cell/hooks/useOpenRecordTableCellFromCell';

import { RecordTableCellDisplayContainer } from './RecordTableCellDisplayContainer';

export const RecordTableCellDisplayMode = ({
  children,
}: React.PropsWithChildren<unknown>) => {
  const cellPosition = useCurrentTableCellPosition();
  const { onMoveSoftFocusToCell } = useContext(RecordTableContext);
  const { openTableCell } = useOpenRecordTableCellFromCell();

  const isFieldInputOnly = useIsFieldInputOnly();

  const handleClick = () => {
    onMoveSoftFocusToCell(cellPosition);

    if (!isFieldInputOnly) {
      openTableCell();
    }
  };

  return (
    <RecordTableCellDisplayContainer onClick={handleClick}>
      {children}
    </RecordTableCellDisplayContainer>
  );
};
