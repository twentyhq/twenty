import { useTableCell } from '../hooks/useTableCell';
import { useSetSoftFocusOnCurrentTableCell } from '../hooks/useSetSoftFocusOnCurrentTableCell';

import { TableCellDisplayContainer } from './TableCellDisplayContainer';

export const TableCellDisplayMode = ({
  children,
  isHovered,
}: React.PropsWithChildren<unknown> & { isHovered?: boolean }) => {
  const setSoftFocusOnCurrentCell = useSetSoftFocusOnCurrentTableCell();

  const { openTableCell: openEditableCell } = useTableCell();

  const handleClick = () => {
    setSoftFocusOnCurrentCell();
    openEditableCell();
  };

  return (
    <TableCellDisplayContainer isHovered={isHovered} onClick={handleClick}>
      {children}
    </TableCellDisplayContainer>
  );
};
