import { ReactNode } from 'react';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';

import { AddObjectFilterFromDetailsButton } from '@/object-record/object-filter-dropdown/components/AddObjectFilterFromDetailsButton';
import { getOperandLabelShort } from '@/object-record/object-filter-dropdown/utils/getOperandLabel';
import { IconArrowDown, IconArrowUp } from '@/ui/display/icon/index';
import { useLazyLoadIcons } from '@/ui/input/hooks/useLazyLoadIcons';
import { useViewBar } from '@/views/hooks/useViewBar';

import { useViewScopedStates } from '../hooks/internal/useViewScopedStates';

import SortOrFilterChip from './SortOrFilterChip';

export type ViewBarDetailsProps = {
  hasFilterButton?: boolean;
  rightComponent?: ReactNode;
  filterDropdownId?: string;
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
  filterDropdownId,
}: ViewBarDetailsProps) => {
  const {
    currentViewSortsState,
    currentViewFiltersState,
    canPersistFiltersSelector,
    canPersistSortsSelector,
    isViewBarExpandedState,
  } = useViewScopedStates();
  const { icons } = useLazyLoadIcons();

  const currentViewSorts = useRecoilValue(currentViewSortsState);
  const currentViewFilters = useRecoilValue(currentViewFiltersState);
  const canPersistFilters = useRecoilValue(canPersistFiltersSelector);
  const canPersistSorts = useRecoilValue(canPersistSortsSelector);
  const isViewBarExpanded = useRecoilValue(isViewBarExpandedState);

  const { resetViewBar, removeViewSort, removeViewFilter } = useViewBar();

  const canPersistView = canPersistFilters || canPersistSorts;

  const handleCancelClick = () => {
    resetViewBar();
  };

  const shouldExpandViewBar =
    canPersistView ||
    ((currentViewSorts?.length || currentViewFilters?.length) &&
      isViewBarExpanded);

  if (!shouldExpandViewBar) {
    return null;
  }

  return (
    <StyledBar>
      <StyledFilterContainer>
        <StyledChipcontainer>
          {currentViewSorts?.map((sort) => {
            return (
              <SortOrFilterChip
                key={sort.fieldMetadataId}
                testId={sort.fieldMetadataId}
                labelValue={sort.definition.label}
                Icon={sort.direction === 'desc' ? IconArrowDown : IconArrowUp}
                isSort
                onRemove={() => removeViewSort(sort.fieldMetadataId)}
              />
            );
          })}
          {!!currentViewSorts?.length && !!currentViewFilters?.length && (
            <StyledSeperatorContainer>
              <StyledSeperator />
            </StyledSeperatorContainer>
          )}
          {currentViewFilters?.map((filter) => {
            return (
              <SortOrFilterChip
                key={filter.fieldMetadataId}
                testId={filter.fieldMetadataId}
                labelKey={filter.definition.label}
                labelValue={`${getOperandLabelShort(filter.operand)} ${
                  filter.displayValue
                }`}
                Icon={icons[filter.definition.iconName]}
                onRemove={() => {
                  removeViewFilter(filter.fieldMetadataId);
                }}
              />
            );
          })}
        </StyledChipcontainer>
        {hasFilterButton && (
          <StyledAddFilterContainer>
            <AddObjectFilterFromDetailsButton
              filterDropdownId={filterDropdownId}
            />
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
