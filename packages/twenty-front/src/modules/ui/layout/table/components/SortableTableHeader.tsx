import { styled } from '@linaria/react';

import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableHeaderText } from '@/ui/layout/table/components/TableHeaderText';
import { sortedFieldByTableFamilyState } from '@/ui/layout/table/states/sortedFieldByTableFamilyState';
import { type TableSortValue } from '@/ui/layout/table/types/TableSortValue';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';
import { IconArrowDown, IconArrowUp, type IconComponent } from 'twenty-ui/icon';

const StyledSortIconContainer = styled.span`
  align-items: center;
  display: flex;
  flex-shrink: 0;
`;

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

  const isSortOnThisField = sortValue?.fieldName === fieldName;

  const isAsc = isSortOnThisField && sortValue.direction === 'asc';
  const isDesc = isSortOnThisField && sortValue.direction === 'desc';

  const isSortActive = isSortOnThisField;

  const handleClick = () => {
    setSortedFieldByTable({
      fieldName,
      direction: isDesc ? 'asc' : 'desc',
    });
  };

  return (
    <TableHeader align={align} onClick={handleClick}>
      {isSortActive && align === 'right' ? (
        <StyledSortIconContainer>
          {isAsc ? <IconArrowUp size={14} /> : <IconArrowDown size={14} />}
        </StyledSortIconContainer>
      ) : null}
      {Icon && <Icon size={14} />}
      <TableHeaderText>{label}</TableHeaderText>
      {isSortActive && align === 'left' ? (
        <StyledSortIconContainer>
          {isAsc ? <IconArrowUp size={14} /> : <IconArrowDown size={14} />}
        </StyledSortIconContainer>
      ) : null}
    </TableHeader>
  );
};
