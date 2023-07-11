import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { useRemoveActiveFilter } from '@/lib/filters-and-sorts/hooks/useRemoveActiveFilter';
import { SelectedSortType } from '@/lib/filters-and-sorts/interfaces/sorts/interface';
import { activeFiltersScopedState } from '@/lib/filters-and-sorts/states/activeFiltersScopedState';
import { availableFiltersScopedState } from '@/lib/filters-and-sorts/states/availableFiltersScopedState';
import { getOperandLabel } from '@/lib/filters-and-sorts/utils/getOperandLabel';
import { useRecoilScopedState } from '@/recoil-scope/hooks/useRecoilScopedState';
import { IconArrowNarrowDown, IconArrowNarrowUp } from '@/ui/icons/index';
import { TableContext } from '@/ui/tables/states/TableContext';

import SortOrFilterChip from './SortOrFilterChip';

type OwnProps<SortField> = {
  sorts: Array<SelectedSortType<SortField>>;
  onRemoveSort: (sortId: SelectedSortType<SortField>['key']) => void;
  onCancelClick: () => void;
};

const StyledBar = styled.div`
  align-items: center;
  border-top: 1px solid ${({ theme }) => theme.border.color.light};
  display: flex;
  flex-direction: row;
  height: 40px;
  justify-content: space-between;
`;

const StyledChipcontainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(1)};
  height: 40px;
  justify-content: space-between;
  margin-left: ${({ theme }) => theme.spacing(2)};
  overflow-x: auto;
`;

const StyledCancelButton = styled.button`
  background-color: inherit;
  border: none;
  color: ${({ theme }) => theme.font.color.secondary};
  cursor: pointer;
  font-weight: ${({ theme }) => theme.font.weight.medium};
  margin-left: auto;
  margin-right: ${({ theme }) => theme.spacing(2)};
  padding: ${(props) => {
    const horiz = props.theme.spacing(2);
    const vert = props.theme.spacing(1);
    return `${vert} ${horiz} ${vert} ${horiz}`;
  }};
  user-select: none;

  &:hover {
    background-color: ${({ theme }) => theme.background.tertiary};
    border-radius: ${({ theme }) => theme.spacing(1)};
  }
`;

function SortAndFilterBar<SortField>({
  sorts,
  onRemoveSort,
  onCancelClick,
}: OwnProps<SortField>) {
  const theme = useTheme();

  const [activeFilters, setActiveFilters] = useRecoilScopedState(
    activeFiltersScopedState,
    TableContext,
  );

  const [availableFilters] = useRecoilScopedState(
    availableFiltersScopedState,
    TableContext,
  );

  const activeFiltersWithDefinition = activeFilters.map((activeFilter) => {
    const tableFilterDefinition = availableFilters.find((availableFilter) => {
      return availableFilter.field === activeFilter.field;
    });

    return {
      ...activeFilter,
      ...tableFilterDefinition,
    };
  });

  const removeActiveFilter = useRemoveActiveFilter();

  function handleCancelClick() {
    setActiveFilters([]);
    onCancelClick();
  }

  if (!activeFiltersWithDefinition.length && !sorts.length) {
    return null;
  }

  return (
    <StyledBar>
      <StyledChipcontainer>
        {sorts.map((sort) => {
          return (
            <SortOrFilterChip
              key={sort.key}
              labelValue={sort.label}
              id={sort.key}
              icon={
                sort.order === 'desc' ? (
                  <IconArrowNarrowDown size={theme.icon.size.md} />
                ) : (
                  <IconArrowNarrowUp size={theme.icon.size.md} />
                )
              }
              onRemove={() => onRemoveSort(sort.key)}
            />
          );
        })}
        {activeFiltersWithDefinition.map((filter) => {
          return (
            <SortOrFilterChip
              key={filter.field}
              labelKey={filter.label}
              labelValue={`${getOperandLabel(filter.operand)} ${
                filter.displayValue
              }`}
              id={filter.field}
              icon={filter.icon}
              onRemove={() => {
                removeActiveFilter(filter.field);
              }}
            />
          );
        })}
      </StyledChipcontainer>
      {activeFilters.length + sorts.length > 0 && (
        <StyledCancelButton
          data-testid={'cancel-button'}
          onClick={handleCancelClick}
        >
          Cancel
        </StyledCancelButton>
      )}
    </StyledBar>
  );
}

export default SortAndFilterBar;
