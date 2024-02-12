import { useIsFieldInputOnly } from '@/object-record/record-field/hooks/useIsFieldInputOnly';
import { useOpenRecordTableCell } from '@/object-record/record-table/record-table-cell/hooks/useOpenRecordTableCell';

import { useSetSoftFocusOnCurrentTableCell } from '../hooks/useSetSoftFocusOnCurrentTableCell';

import { RecordTableCellDisplayContainer } from './RecordTableCellDisplayContainer';

export const RecordTableCellDisplayMode = ({
  children,
}: React.PropsWithChildren<unknown>) => {
  const setSoftFocusOnCurrentCell = useSetSoftFocusOnCurrentTableCell();

  const isFieldInputOnly = useIsFieldInputOnly();

  const { openTableCell } = useOpenRecordTableCell();

  const handleClick = () => {
    setSoftFocusOnCurrentCell();

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
