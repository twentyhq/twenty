import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { useIsFieldInputOnly } from '@/object-record/record-field/ui/hooks/useIsFieldInputOnly';
import { useIsFieldValueRestricted } from '@/object-record/record-field/ui/hooks/useIsFieldValueRestricted';
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

  const { openRecordContextMenu } = useRecordTableBodyContextOrThrow();

  const { openTableCell } = useOpenRecordTableCellFromCell();

  const isFieldInputOnly = useIsFieldInputOnly();

  const isFieldValueRestricted = useIsFieldValueRestricted();

  const handleClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (!isFieldInputOnly && !isReadOnly && !isFieldValueRestricted) {
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
