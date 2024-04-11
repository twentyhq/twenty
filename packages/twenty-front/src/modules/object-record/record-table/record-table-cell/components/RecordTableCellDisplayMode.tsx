import { useContext } from 'react';

import { useIsFieldInputOnly } from '@/object-record/record-field/hooks/useIsFieldInputOnly';
import { RecordTableRowContext } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { useOpenRecordTableCell } from '@/object-record/record-table/record-table-cell/hooks/useOpenRecordTableCell';

import { useSetSoftFocusOnCurrentTableCell } from '../hooks/useSetSoftFocusOnCurrentTableCell';

import { RecordTableCellDisplayContainer } from './RecordTableCellDisplayContainer';

export const RecordTableCellDisplayMode = ({
  children,
}: React.PropsWithChildren<unknown>) => {
  const setSoftFocusOnCurrentCell = useSetSoftFocusOnCurrentTableCell();

  const { isReadOnly } = useContext(RecordTableRowContext);

  const isFieldInputOnly = useIsFieldInputOnly();

  const { openTableCell } = useOpenRecordTableCell();

  const handleClick = () => {
    setSoftFocusOnCurrentCell();

    if (!isFieldInputOnly && !isReadOnly) {
      openTableCell();
    }
  };

  return (
    <RecordTableCellDisplayContainer onClick={handleClick}>
      {children}
    </RecordTableCellDisplayContainer>
  );
};
