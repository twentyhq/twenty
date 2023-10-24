import { ReactNode } from 'react';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';

import { IconArrowDown, IconArrowUp } from '@/ui/display/icon/index';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';
import { useRecoilScopeId } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopeId';
import { useViewInternal } from '@/views/hooks/useViewInternal';

import { canPersistSortsScopedFamilySelector } from '../../../../views/states/selectors/canPersistSortsScopedFamilySelector';
import { savedSortsFamilySelector } from '../../../../views/states/selectors/savedSortsFamilySelector';
import { AddFilterFromDropdownButton } from '../../filter/components/AddFilterFromDetailsButton';
import { useSort } from '../../sort/hooks/useSort';
import { useRemoveFilter } from '../hooks/useRemoveFilter';
import { availableFiltersScopedState } from '../states/availableFiltersScopedState';
import { filtersScopedState } from '../states/filtersScopedState';
import { isViewBarExpandedScopedState } from '../states/isViewBarExpandedScopedState';
import { canPersistFiltersScopedFamilySelector } from '../states/selectors/canPersistFiltersScopedFamilySelector';
import { savedFiltersFamilySelector } from '../states/selectors/savedFiltersFamilySelector';
import { getOperandLabelShort } from '../utils/getOperandLabel';

import SortOrFilterChip from './SortOrFilterChip';

export type ViewBarDetailsProps = {
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
  margin-left: ${({ theme }) => theme.spacing(1)};
  z-index: 5;
`;

export const ViewBarDetails = ({
  hasFilterButton = false,
  rightComponent,
}: ViewBarDetailsProps) => {
  const {
    scopeId: viewScopeId,
    canPersistViewFields,
    onViewBarReset,
    ViewBarRecoilScopeContext,
    currentViewId,
  } = useViewInternal();

  const { sorts, setSorts } = useSort();

  const recoilScopeId = useRecoilScopeId(ViewBarRecoilScopeContext);

  const [filters, setFilters] = useRecoilScopedState(
    filtersScopedState,
    ViewBarRecoilScopeContext,
  );

  const savedFilters = useRecoilValue(
    savedFiltersFamilySelector(currentViewId),
  );

  const savedSorts = useRecoilValue(
    savedSortsFamilySelector({
      scopeId: viewScopeId,
      viewId: currentViewId,
    }),
  );

  const [availableFilters] = useRecoilScopedState(
    availableFiltersScopedState,
    ViewBarRecoilScopeContext,
  );
  const canPersistFilters = useRecoilValue(
    canPersistFiltersScopedFamilySelector({
      recoilScopeId,
      viewId: currentViewId,
    }),
  );

  const canPersistSorts = useRecoilValue(
    canPersistSortsScopedFamilySelector({
      viewScopeId: recoilScopeId,
      viewId: currentViewId,
    }),
  );

  const canPersistView =
    canPersistViewFields || canPersistFilters || canPersistSorts;

  const [isViewBarExpanded] = useRecoilScopedState(
    isViewBarExpandedScopedState,
    ViewBarRecoilScopeContext,
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

  const removeFilter = useRemoveFilter();

  const handleCancelClick = () => {
    onViewBarReset?.();
    setFilters(savedFilters);
    setSorts(savedSorts);
  };

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
                labelValue={sort.definition.label}
                Icon={sort.direction === 'desc' ? IconArrowDown : IconArrowUp}
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
            <AddFilterFromDropdownButton />
          </StyledAddFilterContainer>
        )}
      </StyledFilterContainer>
      {canPersistView && (
        <StyledCancelButton
          data-testid="cancel-button"
          onClick={handleCancelClick}
        >
          Reset
        </StyledCancelButton>
      )}
      {rightComponent}
    </StyledBar>
  );
};
