import { ReactNode, useMemo } from 'react';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';

import { AddObjectFilterFromDetailsButton } from '@/object-record/object-filter-dropdown/components/AddObjectFilterFromDetailsButton';
import { ObjectFilterDropdownScope } from '@/object-record/object-filter-dropdown/scopes/ObjectFilterDropdownScope';
import { DropdownScope } from '@/ui/layout/dropdown/scopes/DropdownScope';
import { EditableFilterDropdownButton } from '@/views/components/EditableFilterDropdownButton';
import { EditableSortChip } from '@/views/components/EditableSortChip';
import { ViewBarFilterEffect } from '@/views/components/ViewBarFilterEffect';
import { useViewFromQueryParams } from '@/views/hooks/internal/useViewFromQueryParams';
import { useViewStates } from '@/views/hooks/internal/useViewStates';
import { useGetCurrentView } from '@/views/hooks/useGetCurrentView';
import { useResetCurrentView } from '@/views/hooks/useResetCurrentView';
import { mapViewFiltersToFilters } from '@/views/utils/mapViewFiltersToFilters';
import { mapViewSortsToSorts } from '@/views/utils/mapViewSortsToSorts';
import { VariantFilterChip } from './VariantFilterChip';
import { Filter } from '@/object-record/object-filter-dropdown/types/Filter';

export type ViewBarDetailsProps = {
  hasFilterButton?: boolean;
  rightComponent?: ReactNode;
  filterDropdownId?: string;
  viewBarId: string;
};

const StyledBar = styled.div`
  align-items: center;
  border-top: 1px solid ${({ theme }) => theme.border.color.light};
  display: flex;
  flex-direction: row;
  min-height: 32px;
  justify-content: space-between;
  z-index: 4;
  padding-top: ${({ theme }) => theme.spacing(1)};
  padding-bottom: ${({ theme }) => theme.spacing(1)};
`;

const StyledChipcontainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(1)};
  min-height: 32px;
  margin-left: ${({ theme }) => theme.spacing(2)};
  flex-wrap: wrap;
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
    canPersistViewSelector,
    isViewBarExpandedState,
    availableFilterDefinitionsState,
    availableSortDefinitionsState,
  } = useViewStates();

  const { currentViewWithCombinedFiltersAndSorts } = useGetCurrentView();

  const isViewBarExpanded = useRecoilValue(isViewBarExpandedState);
  const { hasFiltersQueryParams } = useViewFromQueryParams();
  const canPersistView = useRecoilValue(canPersistViewSelector());
  const availableFilterDefinitions = useRecoilValue(
    availableFilterDefinitionsState,
  );
  const availableSortDefinitions = useRecoilValue(
    availableSortDefinitionsState,
  );

  const { resetCurrentView } = useResetCurrentView();
  const canResetView = canPersistView && !hasFiltersQueryParams;

  const { otherViewFilters, defaultViewFilters } = useMemo(() => {
    if (!currentViewWithCombinedFiltersAndSorts) {
      return {
        otherViewFilters: [],
        defaultViewFilters: [],
      };
    }

    const otherViewFilters =
      currentViewWithCombinedFiltersAndSorts.viewFilters.filter(
        (viewFilter) => viewFilter.variant && viewFilter.variant !== 'default',
      );
    const defaultViewFilters =
      currentViewWithCombinedFiltersAndSorts.viewFilters.filter(
        (viewFilter) => !viewFilter.variant || viewFilter.variant === 'default',
      );

    return {
      otherViewFilters,
      defaultViewFilters,
    };
  }, [currentViewWithCombinedFiltersAndSorts]);

  const handleCancelClick = () => {
    resetCurrentView();
  };

  const shouldExpandViewBar =
    canPersistView ||
    ((currentViewWithCombinedFiltersAndSorts?.viewSorts?.length ||
      currentViewWithCombinedFiltersAndSorts?.viewFilters?.length) &&
      isViewBarExpanded);

  if (!shouldExpandViewBar) {
    return null;
  }

  console.log(
    'currentViewWithCombinedFiltersAndSorts?.viewFilters: ',
    currentViewWithCombinedFiltersAndSorts?.viewFilters,
  );

  return (
    <StyledBar>
      <StyledFilterContainer>
        <StyledChipcontainer>
          {otherViewFilters.map((viewFilter) => (
            <VariantFilterChip
              key={viewFilter.fieldMetadataId}
              // Why do we have two types, Filter and ViewFilter?
              // Why key defition is already present in the Filter type and added on the fly here with mapViewFiltersToFilters ?
              // FixMe: Ugly hack to make it work
              viewFilter={viewFilter as unknown as Filter}
            />
          ))}
          {!!otherViewFilters.length &&
            !!currentViewWithCombinedFiltersAndSorts?.viewSorts?.length && (
              <StyledSeperatorContainer>
                <StyledSeperator />
              </StyledSeperatorContainer>
            )}
          {mapViewSortsToSorts(
            currentViewWithCombinedFiltersAndSorts?.viewSorts ?? [],
            availableSortDefinitions,
          ).map((sort) => (
            <EditableSortChip key={sort.fieldMetadataId} viewSort={sort} />
          ))}
          {!!currentViewWithCombinedFiltersAndSorts?.viewSorts?.length &&
            !!defaultViewFilters.length && (
              <StyledSeperatorContainer>
                <StyledSeperator />
              </StyledSeperatorContainer>
            )}
          {mapViewFiltersToFilters(
            defaultViewFilters,
            availableFilterDefinitions,
          ).map((viewFilter) => (
            <ObjectFilterDropdownScope
              key={viewFilter.id}
              filterScopeId={viewFilter.id}
            >
              <DropdownScope dropdownScopeId={viewFilter.id}>
                <ViewBarFilterEffect filterDropdownId={viewFilter.id} />
                <EditableFilterDropdownButton
                  viewFilter={viewFilter}
                  hotkeyScope={{
                    scope: viewFilter.id,
                  }}
                  viewFilterDropdownId={viewFilter.id}
                />
              </DropdownScope>
            </ObjectFilterDropdownScope>
          ))}
        </StyledChipcontainer>
        {hasFilterButton && (
          <StyledAddFilterContainer>
            <AddObjectFilterFromDetailsButton
              filterDropdownId={filterDropdownId}
            />
          </StyledAddFilterContainer>
        )}
      </StyledFilterContainer>
      {canResetView && (
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
