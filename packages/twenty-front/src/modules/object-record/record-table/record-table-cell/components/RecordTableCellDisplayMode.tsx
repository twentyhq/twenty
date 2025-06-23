import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { useIsFieldInputOnly } from '@/object-record/record-field/hooks/useIsFieldInputOnly';
import { useRecordTableBodyContextOrThrow } from '@/object-record/record-table/contexts/RecordTableBodyContext';
import { useOpenRecordTableCellFromCell } from '@/object-record/record-table/record-table-cell/hooks/useOpenRecordTableCellFromCell';
import { ReactNode, useContext } from 'react';
import { RecordTableCellDisplayContainer } from './RecordTableCellDisplayContainer';

export const RecordTableCellDisplayMode = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { recordId, isReadOnly } = useContext(FieldContext);

  const { onActionMenuDropdownOpened } = useRecordTableBodyContextOrThrow();

  const { openTableCell } = useOpenRecordTableCellFromCell();

  const isFieldInputOnly = useIsFieldInputOnly();

  const handleActionMenuDropdown = (event: React.MouseEvent) => {
    onActionMenuDropdownOpened(event, recordId);
  };

  const handleClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (!isFieldInputOnly && !isReadOnly) {
      openTableCell();
    }
  };

  return (
    <RecordTableCellDisplayContainer
      onContextMenu={handleActionMenuDropdown}
      onClick={handleClick}
    >
      {children}
    </RecordTableCellDisplayContainer>
  );
};
