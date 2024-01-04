import { useIsFieldInputOnly } from '@/object-record/field/hooks/useIsFieldInputOnly';

import { useSetSoftFocusOnCurrentTableCell } from '../hooks/useSetSoftFocusOnCurrentTableCell';
import { useTableCell } from '../hooks/useTableCell';

import { RecordTableCellDisplayContainer } from './RecordTableCellDisplayContainer';

export const RecordTableCellDisplayMode = ({
  children,
}: React.PropsWithChildren<unknown>) => {
  const setSoftFocusOnCurrentCell = useSetSoftFocusOnCurrentTableCell();

  const isFieldInputOnly = useIsFieldInputOnly();

  const { openTableCell } = useTableCell();

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
