import type { Context, ReactNode } from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import {
  IconArrowNarrowDown,
  IconArrowNarrowUp,
  IconPlus,
} from '@/ui/icon/index';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';

import { useRemoveFilter } from '../hooks/useRemoveFilter';
import { availableFiltersScopedState } from '../states/availableFiltersScopedState';
import { filtersScopedState } from '../states/filtersScopedState';
import { isViewBarExpandedScopedState } from '../states/isViewBarExpandedScopedState';
import { FiltersHotkeyScope } from '../types/FiltersHotkeyScope';
import { SelectedSortType } from '../types/interface';
import { getOperandLabelShort } from '../utils/getOperandLabel';

import { FilterDropdownButton } from './FilterDropdownButton';
import SortOrFilterChip from './SortOrFilterChip';

type OwnProps<SortField> = {
  canPersistView?: boolean;
  context: Context<string | null>;
  sorts: Array<SelectedSortType<SortField>>;
  onRemoveSort: (sortId: SelectedSortType<SortField>['key']) => void;
  onCancelClick: () => void;
  hasFilterButton?: boolean;
  rightComponent?: ReactNode;
};

const StyledBar = styled.div`
  align-items: center;
  border-top: 1px solid ${({ theme }) => theme.border.color.light};
  display: flex;
  flex-direction: row;
  height: 40px;
  justify-content: space-between;
  z-index: 4;
`;

const StyledChipcontainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(1)};
  height: 40px;
  justify-content: space-between;
  margin-left: ${({ theme }) => theme.spacing(2)};
  margin-right: ${({ theme }) => theme.spacing(1)};
  overflow-x: auto;
`;

const StyledCancelButton = styled.button`
  background-color: inherit;
  border: none;
  color: ${({ theme }) => theme.font.color.tertiary};
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

const StyledFilterContainer = styled.div`
  align-items: center;
  display: flex;
`;

const StyledSeperatorContainer = styled.div`
  align-items: flex-start;
  align-self: stretch;
  display: flex;
  padding-bottom: ${({ theme }) => theme.spacing(2)};
  padding-left: ${({ theme }) => theme.spacing(1)};
  padding-right: ${({ theme }) => theme.spacing(1)};
  padding-top: ${({ theme }) => theme.spacing(2)};
`;

const StyledSeperator = styled.div`
  align-self: stretch;
  background: ${({ theme }) => theme.background.quaternary};
  width: 1px;
`;

const StyledAddFilterContainer = styled.div`
  z-index: 5;
`;

function ViewBarDetails<SortField>({
  canPersistView,
  context,
  sorts,
  onRemoveSort,
  onCancelClick,
  hasFilterButton = false,
  rightComponent,
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

  const [isViewBarExpanded] = useRecoilScopedState(
    isViewBarExpandedScopedState,
    context,
  );

  const filtersWithDefinition = filters.map((filter) => {
    const filterDefinition = availableFilters.find((availableFilter) => {
      return availableFilter.key === filter.key;
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

  const shouldExpandViewBar =
    canPersistView ||
    ((filtersWithDefinition.length || sorts.length) && isViewBarExpanded);

  if (!shouldExpandViewBar) {
    return null;
  }

  return (
    <StyledBar>
      <StyledFilterContainer>
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
                isSort
                onRemove={() => onRemoveSort(sort.key)}
              />
            );
          })}
          {!!sorts.length && !!filtersWithDefinition.length && (
            <StyledSeperatorContainer>
              <StyledSeperator />
            </StyledSeperatorContainer>
          )}
          {filtersWithDefinition.map((filter) => {
            return (
              <SortOrFilterChip
                key={filter.key}
                labelKey={filter.label}
                labelValue={`${getOperandLabelShort(filter.operand)} ${
                  filter.displayValue
                }`}
                id={filter.key}
                icon={filter.icon}
                onRemove={() => {
                  removeFilter(filter.key);
                }}
              />
            );
          })}
        </StyledChipcontainer>
        {hasFilterButton && (
          <StyledAddFilterContainer>
            <FilterDropdownButton
              context={context}
              HotkeyScope={FiltersHotkeyScope.FilterDropdownButton}
              color={theme.font.color.tertiary}
              icon={<IconPlus size={theme.icon.size.md} />}
              label="Add filter"
            />
          </StyledAddFilterContainer>
        )}
      </StyledFilterContainer>
      {filters.length + sorts.length > 0 && (
        <StyledCancelButton
          data-testid="cancel-button"
          onClick={handleCancelClick}
        >
          Cancel
        </StyledCancelButton>
      )}
      {rightComponent}
    </StyledBar>
  );
}

export default ViewBarDetails;
