import { ReactNode } from 'react';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';

import { AddObjectFilterFromDetailsButton } from '@/ui/object/object-filter-dropdown/components/AddObjectFilterFromDetailsButton';
import { EditObjectFilter } from '@/ui/object/object-filter-dropdown/components/EditObjectFilter';
import { EditObjectSort } from '@/ui/object/object-sort-dropdown/components/EditObjectSort';

import { useViewScopedStates } from '../hooks/internal/useViewScopedStates';
import { useView } from '../hooks/useView';

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
    currentViewSortsState,
    currentViewFiltersState,
    canPersistFiltersSelector,
    canPersistSortsSelector,
    isViewBarExpandedState,
  } = useViewScopedStates();

  const currentViewSorts = useRecoilValue(currentViewSortsState);
  const currentViewFilters = useRecoilValue(currentViewFiltersState);
  const canPersistFilters = useRecoilValue(canPersistFiltersSelector);
  const canPersistSorts = useRecoilValue(canPersistSortsSelector);
  const isViewBarExpanded = useRecoilValue(isViewBarExpandedState);

  const { resetViewBar } = useView();

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
              <>
                <EditObjectSort
                  key={sort.fieldMetadataId}
                  fieldMetadataId={sort.fieldMetadataId}
                  label={sort.definition.label}
                  direction={sort.direction}
                />
              </>
            );
          })}
          {!!currentViewSorts?.length && !!currentViewFilters?.length && (
            <StyledSeperatorContainer>
              <StyledSeperator />
            </StyledSeperatorContainer>
          )}
          {currentViewFilters?.map((filter) => (
            <EditObjectFilter
              key={filter.fieldMetadataId}
              fieldMetadataId={filter.fieldMetadataId}
              label={filter.definition.label}
              iconName={filter.definition.iconName}
              value={filter.value}
              displayValue={filter.displayValue}
            />
          ))}
        </StyledChipcontainer>
        {hasFilterButton && (
          <StyledAddFilterContainer>
            <AddObjectFilterFromDetailsButton />
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
