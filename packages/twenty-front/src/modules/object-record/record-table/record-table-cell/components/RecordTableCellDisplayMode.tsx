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
  const {
    recordId,
    isRecordFieldReadOnly: isReadOnly,
    isOnDemand,
  } = useContext(FieldContext);

  const { openRecordContextMenu } = useRecordTableBodyContextOrThrow();

  const { openTableCell } = useOpenRecordTableCellFromCell();

  const isFieldInputOnly = useIsFieldInputOnly();

  const handleClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (!isFieldInputOnly && !isReadOnly && !isOnDemand) {
      openTableCell();
    }
  };

  return (
    <RecordTableCellDisplayContainer
      onContextMenu={(event) => openRecordContextMenu({ event, recordId })}
      onClick={handleClick}
    >
      {children}
    </RecordTableCellDisplayContainer>
  );
};
