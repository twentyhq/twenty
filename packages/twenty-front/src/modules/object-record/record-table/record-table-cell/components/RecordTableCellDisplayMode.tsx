import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { useIsFieldInputOnly } from '@/object-record/record-field/hooks/useIsFieldInputOnly';
import { useRecordTableBodyContextOrThrow } from '@/object-record/record-table/contexts/RecordTableBodyContext';
import { RecordTableCellContext } from '@/object-record/record-table/contexts/RecordTableCellContext';
import { RecordTableCellEditButton } from '@/object-record/record-table/record-table-cell/components/RecordTableCellEditButton';
import { useOpenRecordTableCellFromCell } from '@/object-record/record-table/record-table-cell/hooks/useOpenRecordTableCellFromCell';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { useContext } from 'react';
import { RecordTableCellDisplayContainer } from './RecordTableCellDisplayContainer';

export const RecordTableCellDisplayMode = ({
  children,
}: React.PropsWithChildren) => {
  const { recordId, isReadOnly } = useContext(FieldContext);

  const { columnIndex } = useContext(RecordTableCellContext);

  const isMobile = useIsMobile();

  const { onActionMenuDropdownOpened } = useRecordTableBodyContextOrThrow();

  const { openTableCell } = useOpenRecordTableCellFromCell();

  const isFieldInputOnly = useIsFieldInputOnly();
  const isFirstColumn = columnIndex === 0;

  const showButton =
    false && !isFieldInputOnly && !isReadOnly && !(isMobile && isFirstColumn);

  const handleActionMenuDropdown = (event: React.MouseEvent) => {
    onActionMenuDropdownOpened(event, recordId);
  };

  const handleClick = () => {
    if (!isFieldInputOnly && !isReadOnly) {
      openTableCell();
    }
  };

  return (
    <>
      <RecordTableCellDisplayContainer
        onContextMenu={handleActionMenuDropdown}
        onClick={handleClick}
      >
        {children}
      </RecordTableCellDisplayContainer>
      {showButton && <RecordTableCellEditButton />}
    </>
  );
};
