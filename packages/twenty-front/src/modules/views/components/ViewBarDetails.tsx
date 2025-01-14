import styled from '@emotion/styled';
import { ReactNode, useMemo } from 'react';

import { useObjectNameSingularFromPlural } from '@/object-metadata/hooks/useObjectNameSingularFromPlural';
import { AddObjectFilterFromDetailsButton } from '@/object-record/object-filter-dropdown/components/AddObjectFilterFromDetailsButton';
import { ObjectFilterDropdownComponentInstanceContext } from '@/object-record/object-filter-dropdown/states/contexts/ObjectFilterDropdownComponentInstanceContext';
import { RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { useHandleToggleTrashColumnFilter } from '@/object-record/record-index/hooks/useHandleToggleTrashColumnFilter';
import { DropdownScope } from '@/ui/layout/dropdown/scopes/DropdownScope';
import { useRecoilComponentFamilyValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValueV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { AdvancedFilterDropdownButton } from '@/views/components/AdvancedFilterDropdownButton';
import { EditableFilterDropdownButton } from '@/views/components/EditableFilterDropdownButton';
import { EditableSortChip } from '@/views/components/EditableSortChip';
import { ViewBarFilterEffect } from '@/views/components/ViewBarFilterEffect';
import { useViewFromQueryParams } from '@/views/hooks/internal/useViewFromQueryParams';
import { useGetCurrentView } from '@/views/hooks/useGetCurrentView';
import { useResetUnsavedViewStates } from '@/views/hooks/useResetUnsavedViewStates';
import { availableFilterDefinitionsComponentState } from '@/views/states/availableFilterDefinitionsComponentState';
import { availableSortDefinitionsComponentState } from '@/views/states/availableSortDefinitionsComponentState';
import { isViewBarExpandedComponentState } from '@/views/states/isViewBarExpandedComponentState';
import { canPersistViewComponentFamilySelector } from '@/views/states/selectors/canPersistViewComponentFamilySelector';
import { mapViewFiltersToFilters } from '@/views/utils/mapViewFiltersToFilters';
import { mapViewSortsToSorts } from '@/views/utils/mapViewSortsToSorts';
import { isDefined } from 'twenty-ui';
import { VariantFilterChip } from './VariantFilterChip';

export type ViewBarDetailsProps = {
  hasFilterButton?: boolean;
  rightComponent?: ReactNode;
  filterDropdownId?: string;
  viewBarId: string;
  objectNamePlural: string;
};

const StyledBar = styled.div`
  align-items: center;
  align-items: center;
  border-top: 1px solid ${({ theme }) => theme.border.color.light};
  border-top: 1px solid ${({ theme }) => theme.border.color.light};
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  min-height: 32px;
  padding-top: ${({ theme }) => theme.spacing(1)};
  padding-bottom: ${({ theme }) => theme.spacing(1)};
  z-index: 4;
`;

const StyledChipcontainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  overflow: scroll;
  gap: ${({ theme }) => theme.spacing(1)};
  padding-top: ${({ theme }) => theme.spacing(1)};
  z-index: 1;
`;

const StyledCancelButton = styled.button`
  background-color: inherit;
  border: none;
  color: ${({ theme }) => theme.font.color.tertiary};
  cursor: pointer;
  font-weight: ${({ theme }) => theme.font.weight.medium};
  user-select: none;
  margin-right: ${({ theme }) => theme.spacing(2)};
  &:hover {
    background-color: ${({ theme }) => theme.background.tertiary};
    border-radius: ${({ theme }) => theme.spacing(1)};
  }
`;

const StyledFilterContainer = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
  overflow-x: hidden;
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
  viewBarId,
  objectNamePlural,
}: ViewBarDetailsProps) => {
  const { currentViewWithCombinedFiltersAndSorts } = useGetCurrentView();

  const viewId = currentViewWithCombinedFiltersAndSorts?.id;

  const isViewBarExpanded = useRecoilComponentValueV2(
    isViewBarExpandedComponentState,
  );

  const { hasFiltersQueryParams } = useViewFromQueryParams();

  const canPersistView = useRecoilComponentFamilyValueV2(
    canPersistViewComponentFamilySelector,
    { viewId },
  );

  const availableFilterDefinitions = useRecoilComponentValueV2(
    availableFilterDefinitionsComponentState,
  );

  const availableSortDefinitions = useRecoilComponentValueV2(
    availableSortDefinitionsComponentState,
  );

  const { objectNameSingular } = useObjectNameSingularFromPlural({
    objectNamePlural: objectNamePlural,
  });
  const { toggleSoftDeleteFilterState } = useHandleToggleTrashColumnFilter({
    objectNameSingular: objectNameSingular,
    viewBarId: viewBarId,
  });
  const { resetUnsavedViewStates } = useResetUnsavedViewStates();
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
        (viewFilter) =>
          viewFilter.variant &&
          viewFilter.variant !== 'default' &&
          !viewFilter.viewFilterGroupId,
      );
    const defaultViewFilters =
      currentViewWithCombinedFiltersAndSorts.viewFilters.filter(
        (viewFilter) =>
          (!viewFilter.variant || viewFilter.variant === 'default') &&
          !viewFilter.viewFilterGroupId,
      );

    return {
      otherViewFilters,
      defaultViewFilters,
    };
  }, [currentViewWithCombinedFiltersAndSorts]);

  const handleCancelClick = () => {
    if (isDefined(viewId)) {
      resetUnsavedViewStates(viewId);
      toggleSoftDeleteFilterState(false);
    }
  };

  const shouldExpandViewBar =
    canPersistView ||
    ((currentViewWithCombinedFiltersAndSorts?.viewSorts?.length ||
      currentViewWithCombinedFiltersAndSorts?.viewFilters?.length) &&
      isViewBarExpanded);

  if (!shouldExpandViewBar) {
    return null;
  }

  const showAdvancedFilterDropdownButton =
    currentViewWithCombinedFiltersAndSorts?.viewFilterGroups &&
    currentViewWithCombinedFiltersAndSorts?.viewFilterGroups.length > 0;

  return (
    <StyledBar>
      <StyledFilterContainer>
        <StyledChipcontainer>
          {otherViewFilters.map((viewFilter) => (
            <VariantFilterChip
              key={viewFilter.fieldMetadataId}
              // Why do we have two types, Filter and ViewFilter?
              // Why key defition is already present in the Filter type and added on the fly here with mapViewFiltersToFilters ?
              // Also as filter is spread into viewFilter, definition is present
              // FixMe: Ugly hack to make it work
              viewFilter={viewFilter as unknown as RecordFilter}
              viewBarId={viewBarId}
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
          {showAdvancedFilterDropdownButton && <AdvancedFilterDropdownButton />}
          {mapViewFiltersToFilters(
            defaultViewFilters,
            availableFilterDefinitions,
          ).map((viewFilter) => (
            <ObjectFilterDropdownComponentInstanceContext.Provider
              key={viewFilter.id}
              value={{ instanceId: viewFilter.id }}
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
            </ObjectFilterDropdownComponentInstanceContext.Provider>
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
