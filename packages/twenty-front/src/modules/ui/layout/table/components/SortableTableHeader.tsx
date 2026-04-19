import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableHeaderText } from '@/ui/layout/table/components/TableHeaderText';
import { sortedFieldByTableFamilyState } from '@/ui/layout/table/states/sortedFieldByTableFamilyState';
import { type TableSortValue } from '@/ui/layout/table/types/TableSortValue';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';
import {
  IconArrowDown,
  IconArrowUp,
  type IconComponent,
} from 'twenty-ui/display';

export const SortableTableHeader = ({
  tableId,
  fieldName,
  label,
  align = 'left',
  initialSort,
  Icon,
}: {
  tableId: string;
  fieldName: string;
  label: string;
  align?: 'left' | 'center' | 'right';
  initialSort?: TableSortValue;
  Icon?: IconComponent;
}) => {
  const sortedFieldByTable = useAtomFamilyStateValue(
    sortedFieldByTableFamilyState,
    {
      tableId,
    },
  );
  const setSortedFieldByTable = useSetAtomFamilyState(
    sortedFieldByTableFamilyState,
    { tableId },
  );

  const sortValue = sortedFieldByTable ?? initialSort;

  const iSsortOnThisField = sortValue?.fieldName === fieldName;

  const sortDirection = iSsortOnThisField ? sortValue.orderBy : null;

  const isAsc =
    sortDirection === 'AscNullsLast' || sortDirection === 'AscNullsFirst';
  const isDesc =
    sortDirection === 'DescNullsLast' || sortDirection === 'DescNullsFirst';

  const iSsortActive = isAsc || isDesc;

  const handleClick = () => {
    setSortedFieldByTable({
      fieldName,
      orderBy: iSsortOnThisField
        ? sortValue.orderBy === 'AscNullsLast'
          ? 'DescNullsLast'
          : 'AscNullsLast'
        : 'DescNullsLast',
    });
  };

  return (
    <TableHeader align={align} onClick={handleClick}>
      {iSsortActive && align === 'right' ? (
        isAsc ? (
          <IconArrowUp size="14" />
        ) : (
          <IconArrowDown size="14" />
        )
      ) : null}
      {Icon && <Icon size={14} />}
      <TableHeaderText>{label}</TableHeaderText>
      {iSsortActive && align === 'left' ? (
        isAsc ? (
          <IconArrowUp size="14" />
        ) : (
          <IconArrowDown size="14" />
        )
      ) : null}
    </TableHeader>
  );
};
