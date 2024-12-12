import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { useRecordTableBodyContextOrThrow } from '@/object-record/record-table/contexts/RecordTableBodyContext';
import { useContext } from 'react';
import { RecordTableCellDisplayContainer } from './RecordTableCellDisplayContainer';

export const RecordTableCellDisplayMode = ({
  children,
  softFocus,
}: React.PropsWithChildren<{ softFocus?: boolean }>) => {
  const { recordId } = useContext(FieldContext);

  const { onActionMenuDropdownOpened } = useRecordTableBodyContextOrThrow();

  const handleActionMenuDropdown = (event: React.MouseEvent) => {
    onActionMenuDropdownOpened(event, recordId);
  };

  return (
    <RecordTableCellDisplayContainer
      softFocus={softFocus}
      onContextMenu={handleActionMenuDropdown}
    >
      {children}
    </RecordTableCellDisplayContainer>
  );
};
