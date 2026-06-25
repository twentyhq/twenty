import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { useIsFieldInputOnly } from '@/object-record/record-field/ui/hooks/useIsFieldInputOnly';
import { useRecordTableBodyContextOrThrow } from '@/object-record/record-table/contexts/RecordTableBodyContext';
import { useOpenRecordTableCellFromCell } from '@/object-record/record-table/record-table-cell/hooks/useOpenRecordTableCellFromCell';
import { useContext, type ReactNode } from 'react';
import { RecordTableCellDisplayContainer } from './RecordTableCellDisplayContainer';

export const RecordTableCellDisplayMode = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { recordId, isRecordFieldReadOnly: isReadOnly } =
    useContext(FieldContext);

  const { onCommandMenuDropdownOpened } = useRecordTableBodyContextOrThrow();

  const { openTableCell } = useOpenRecordTableCellFromCell();

  const isFieldInputOnly = useIsFieldInputOnly();

  const handleCommandMenuDropdown = (event: React.MouseEvent) => {
    onCommandMenuDropdownOpened(event, recordId);
  };

  const handleClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (!isFieldInputOnly && !isReadOnly) {
      openTableCell();
    }
  };

  return (
    <RecordTableCellDisplayContainer
      onContextMenu={handleCommandMenuDropdown}
      onClick={handleClick}
    >
      {children}
    </RecordTableCellDisplayContainer>
  );
};
