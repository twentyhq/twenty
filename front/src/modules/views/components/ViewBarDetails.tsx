import { ReactNode } from 'react';
import styled from '@emotion/styled';

import { IconArrowDown, IconArrowUp } from '@/ui/display/icon/index';
import { AddFilterFromDropdownButton } from '@/ui/object/filter/components/AddFilterFromDetailsButton';
import { getOperandLabelShort } from '@/ui/object/filter/utils/getOperandLabel';

import { useView } from '../hooks/useView';
import { useViewGetStates } from '../hooks/useViewGetStates';

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
    currentViewSorts,
    currentViewFilters,
    canPersistFilters,
    canPersistSorts,
    isViewBarExpanded,
  } = useViewGetStates();

  const { resetViewBar, removeViewSort, removeViewFilter } = useView();

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
                key={sort.fieldId}
                testId={sort.fieldId}
                labelValue={sort.definition.label}
                Icon={sort.direction === 'desc' ? IconArrowDown : IconArrowUp}
                isSort
                onRemove={() => removeViewSort(sort.fieldId)}
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
                key={filter.fieldId}
                testId={filter.fieldId}
                labelKey={filter.definition.label}
                labelValue={`${getOperandLabelShort(filter.operand)} ${
                  filter.displayValue
                }`}
                Icon={filter.definition.Icon}
                onRemove={() => {
                  removeViewFilter(filter.fieldId);
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
