import { useIsFieldInputOnly } from '@/ui/field/hooks/useIsFieldInputOnly';

import { useSetSoftFocusOnCurrentTableCell } from '../hooks/useSetSoftFocusOnCurrentTableCell';
import { useTableCell } from '../hooks/useTableCell';

import { TableCellDisplayContainer } from './TableCellDisplayContainer';

export const TableCellDisplayMode = ({
  children,
  isHovered,
}: React.PropsWithChildren<unknown> & { isHovered?: boolean }) => {
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
    <TableCellDisplayContainer isHovered={isHovered} onClick={handleClick}>
      {children}
    </TableCellDisplayContainer>
  );
};
