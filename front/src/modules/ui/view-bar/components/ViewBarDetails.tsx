import type { Context, ReactNode } from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';

import {
  IconArrowNarrowDown,
  IconArrowNarrowUp,
  IconPlus,
} from '@/ui/icon/index';
import { useContextScopeId } from '@/ui/utilities/recoil-scope/hooks/useContextScopeId';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';
import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';

import { useRemoveFilter } from '../hooks/useRemoveFilter';
import { availableFiltersScopedState } from '../states/availableFiltersScopedState';
import { currentViewIdScopedState } from '../states/currentViewIdScopedState';
import { filtersScopedState } from '../states/filtersScopedState';
import { isViewBarExpandedScopedState } from '../states/isViewBarExpandedScopedState';
import { canPersistFiltersScopedFamilySelector } from '../states/selectors/canPersistFiltersScopedFamilySelector';
import { canPersistSortsScopedFamilySelector } from '../states/selectors/canPersistSortsScopedFamilySelector';
import { sortsScopedState } from '../states/sortsScopedState';
import { FiltersHotkeyScope } from '../types/FiltersHotkeyScope';
import { SelectedSortType } from '../types/interface';
import { getOperandLabelShort } from '../utils/getOperandLabel';

import { FilterDropdownButton } from './FilterDropdownButton';
import SortOrFilterChip from './SortOrFilterChip';

export type ViewBarDetailsProps = {
  canPersistViewFields?: boolean;
  context: Context<string | null>;
  hasFilterButton?: boolean;
  onReset?: () => void;
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
  canPersistViewFields,
  context,
  hasFilterButton = false,
  onReset,
  rightComponent,
}: ViewBarDetailsProps) {
  const theme = useTheme();

  const recoilScopeId = useContextScopeId(context);

  const currentViewId = useRecoilScopedValue(currentViewIdScopedState, context);

  const [filters, setFilters] = useRecoilScopedState(
    filtersScopedState,
    context,
  );
  const [availableFilters] = useRecoilScopedState(
    availableFiltersScopedState,
    context,
  );
  const canPersistFilters = useRecoilValue(
    canPersistFiltersScopedFamilySelector([recoilScopeId, currentViewId]),
  );

  const [sorts, setSorts] = useRecoilScopedState<SelectedSortType<SortField>[]>(
    sortsScopedState,
    context,
  );
  const canPersistSorts = useRecoilValue(
    canPersistSortsScopedFamilySelector([recoilScopeId, currentViewId]),
  );

  const canPersistView =
    canPersistViewFields || canPersistFilters || canPersistSorts;

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
    onReset?.();
    setFilters([]);
    setSorts([]);
  }

  const handleSortRemove = (sortKey: string) =>
    setSorts((previousSorts) =>
      previousSorts.filter((sort) => sort.key !== sortKey),
    );

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
                testId={sort.key}
                labelValue={sort.label}
                Icon={
                  sort.order === 'desc'
                    ? IconArrowNarrowDown
                    : IconArrowNarrowUp
                }
                isSort
                onRemove={() => handleSortRemove(sort.key)}
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
                testId={filter.key}
                labelKey={filter.label}
                labelValue={`${getOperandLabelShort(filter.operand)} ${
                  filter.displayValue
                }`}
                Icon={filter.Icon}
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
              hotkeyScope={FiltersHotkeyScope.FilterDropdownButton}
              color={theme.font.color.tertiary}
              Icon={IconPlus}
              label="Add filter"
            />
          </StyledAddFilterContainer>
        )}
      </StyledFilterContainer>
      {(filters.length + sorts.length > 0 || canPersistViewFields) && (
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
