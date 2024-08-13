import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { sortedFieldByTableFamilyState } from '@/ui/layout/table/states/sortedFieldByTableFamilyState';
import { useRecoilState } from 'recoil';
import { IconArrowDown, IconArrowUp } from 'twenty-ui';

export const SortableTableHeader = ({
  tableId,
  fieldName,
  label,
  align = 'left',
}: {
  tableId: string;
  fieldName: string;
  label: string;
  align?: 'left' | 'center' | 'right';
}) => {
  const [sortedFieldByTable, setSortedFieldByTable] = useRecoilState(
    sortedFieldByTableFamilyState({ tableId }),
  );

  const isSortOnThisField = sortedFieldByTable?.fieldName === fieldName;

  const sortDirection = isSortOnThisField ? sortedFieldByTable.orderBy : null;

  const isAsc =
    sortDirection === 'AscNullsLast' || sortDirection === 'AscNullsFirst';
  const isDesc =
    sortDirection === 'DescNullsLast' || sortDirection === 'DescNullsFirst';

  const isSortActive = isAsc || isDesc;

  const handleClick = () => {
    setSortedFieldByTable({
      fieldName,
      orderBy: isSortOnThisField
        ? sortedFieldByTable.orderBy === 'AscNullsLast'
          ? 'DescNullsLast'
          : 'AscNullsLast'
        : 'DescNullsLast',
    });
  };

  return (
    <TableHeader align={align} onClick={handleClick}>
      {isSortActive && align === 'right' ? (
        isAsc ? (
          <IconArrowUp size="14" />
        ) : (
          <IconArrowDown size="14" />
        )
      ) : null}
      {label}
      {isSortActive && align === 'left' ? (
        isAsc ? (
          <IconArrowUp size="14" />
        ) : (
          <IconArrowDown size="14" />
        )
      ) : null}
    </TableHeader>
  );
};
