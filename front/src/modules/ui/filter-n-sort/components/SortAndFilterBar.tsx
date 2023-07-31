import { Context } from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { IconArrowNarrowDown, IconArrowNarrowUp } from '@/ui/icon/index';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';

import { useRemoveFilter } from '../hooks/useRemoveFilter';
import { availableFiltersScopedState } from '../states/availableFiltersScopedState';
import { filtersScopedState } from '../states/filtersScopedState';
import { SelectedSortType } from '../types/interface';
import { getOperandLabelShort } from '../utils/getOperandLabel';

import SortOrFilterChip from './SortOrFilterChip';

type OwnProps<SortField> = {
  context: Context<string | null>;
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
  context,
  sorts,
  onRemoveSort,
  onCancelClick,
}: OwnProps<SortField>) {
  const theme = useTheme();

  const [filters, setFilters] = useRecoilScopedState(
    filtersScopedState,
    context,
  );

  const [availableFilters] = useRecoilScopedState(
    availableFiltersScopedState,
    context,
  );

  const filtersWithDefinition = filters
    // Exclude the exclusion projection filter from being displayed in the top bar
    .filter((filter) => filter.type !== '_exclusion_projection')
    .map((filter) => {
      const filterDefinition = availableFilters.find((availableFilter) => {
        return availableFilter.field === filter.field;
      });

      return {
        ...filter,
        ...filterDefinition,
      };
    });

  const removeFilter = useRemoveFilter(context);

  function handleCancelClick() {
    setFilters([]);
    onCancelClick();
  }

  if (!filtersWithDefinition.length && !sorts.length) {
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
        {filtersWithDefinition.map((filter) => {
          return (
            <SortOrFilterChip
              key={filter.field}
              labelKey={filter.label}
              labelValue={`${getOperandLabelShort(filter.operand)} ${
                filter.displayValue
              }`}
              id={filter.field}
              icon={filter.icon}
              onRemove={() => {
                removeFilter(filter.field);
              }}
            />
          );
        })}
      </StyledChipcontainer>
      {filters.length + sorts.length > 0 && (
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
