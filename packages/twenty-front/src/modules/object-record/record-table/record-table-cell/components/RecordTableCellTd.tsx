import { ReactNode, useContext } from 'react';

import { RecordTableTd } from '@/object-record/record-table/components/RecordTableTd';
import { RecordTableRowContext } from '@/object-record/record-table/contexts/RecordTableRowContext';

export const RecordTableCellTd = ({
  firstColumn,
  children,
}: {
  firstColumn?: boolean;
  children: ReactNode;
}) => {
  const { isSelected } = useContext(RecordTableRowContext);

  return firstColumn === true ? (
    <RecordTableTd isSelected={isSelected} zIndex={5}>
      {children}
    </RecordTableTd>
  ) : (
    <RecordTableTd isSelected={isSelected}>{children}</RecordTableTd>
  );
};
