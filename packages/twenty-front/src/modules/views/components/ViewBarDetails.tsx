import styled from '@emotion/styled';
import { ReactNode, useMemo } from 'react';

import { useObjectNameSingularFromPlural } from '@/object-metadata/hooks/useObjectNameSingularFromPlural';
import { AddObjectFilterFromDetailsButton } from '@/object-record/object-filter-dropdown/components/AddObjectFilterFromDetailsButton';
import { ObjectFilterDropdownComponentInstanceContext } from '@/object-record/object-filter-dropdown/states/contexts/ObjectFilterDropdownComponentInstanceContext';
import { useHandleToggleTrashColumnFilter } from '@/object-record/record-index/hooks/useHandleToggleTrashColumnFilter';
import { DropdownScope } from '@/ui/layout/dropdown/scopes/DropdownScope';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { AdvancedFilterDropdownButton } from '@/views/components/AdvancedFilterDropdownButton';
import { EditableFilterDropdownButton } from '@/views/components/EditableFilterDropdownButton';
import { EditableSortChip } from '@/views/components/EditableSortChip';
import { ViewBarFilterEffect } from '@/views/components/ViewBarFilterEffect';
import { useViewFromQueryParams } from '@/views/hooks/internal/useViewFromQueryParams';

import { useCheckIsSoftDeleteFilter } from '@/object-record/record-filter/hooks/useCheckIsSoftDeleteFilter';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { SoftDeleteFilterChip } from '@/views/components/SoftDeleteFilterChip';
import { useApplyCurrentViewFiltersToCurrentRecordFilters } from '@/views/hooks/useApplyCurrentViewFiltersToCurrentRecordFilters';
import { useApplyCurrentViewSortsToCurrentRecordSorts } from '@/views/hooks/useApplyCurrentViewSortsToCurrentRecordSorts';
import { useAreViewFiltersDifferentFromRecordFilters } from '@/views/hooks/useAreViewFiltersDifferentFromRecordFilters';
import { useAreViewSortsDifferentFromRecordSorts } from '@/views/hooks/useAreViewSortsDifferentFromRecordSorts';

import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { useApplyCurrentViewFilterGroupsToCurrentRecordFilterGroups } from '@/views/hooks/useApplyCurrentViewFilterGroupsToCurrentRecordFilterGroups';
import { useAreViewFilterGroupsDifferentFromRecordFilterGroups } from '@/views/hooks/useAreViewFilterGroupsDifferentFromRecordFilterGroups';
import { isViewBarExpandedComponentState } from '@/views/states/isViewBarExpandedComponentState';
import { t } from '@lingui/core/macro';
import { isNonEmptyArray } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { LightButton } from 'twenty-ui/input';

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
  padding-left: ${({ theme }) => theme.spacing(2)};
  z-index: 4;
`;

const StyledChipContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(2)};
  z-index: 1;
`;

const StyledActionButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledFilterContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};

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
  z-index: 5;
`;

export const ViewBarDetails = ({
  hasFilterButton = false,
  rightComponent,
  filterDropdownId,
  viewBarId,
  objectNamePlural,
}: ViewBarDetailsProps) => {
  const isViewBarExpanded = useRecoilComponentValueV2(
    isViewBarExpandedComponentState,
  );

  const { hasFiltersQueryParams } = useViewFromQueryParams();

  const currentRecordFilterGroups = useRecoilComponentValueV2(
    currentRecordFilterGroupsComponentState,
  );

  const currentRecordFilters = useRecoilComponentValueV2(
    currentRecordFiltersComponentState,
  );

  const currentRecordSorts = useRecoilComponentValueV2(
    currentRecordSortsComponentState,
  );

  const { objectNameSingular } = useObjectNameSingularFromPlural({
    objectNamePlural: objectNamePlural,
  });
  const { toggleSoftDeleteFilterState } = useHandleToggleTrashColumnFilter({
    objectNameSingular: objectNameSingular,
    viewBarId: viewBarId,
  });

  const { viewFilterGroupsAreDifferentFromRecordFilterGroups } =
    useAreViewFilterGroupsDifferentFromRecordFilterGroups();

  const { viewFiltersAreDifferentFromRecordFilters } =
    useAreViewFiltersDifferentFromRecordFilters();

  const { viewSortsAreDifferentFromRecordSorts } =
    useAreViewSortsDifferentFromRecordSorts();

  const canResetView =
    (viewFiltersAreDifferentFromRecordFilters ||
      viewSortsAreDifferentFromRecordSorts ||
      viewFilterGroupsAreDifferentFromRecordFilterGroups) &&
    !hasFiltersQueryParams;

  const { checkIsSoftDeleteFilter } = useCheckIsSoftDeleteFilter();

  const softDeleteFilter = currentRecordFilters.find((recordFilter) =>
    checkIsSoftDeleteFilter(recordFilter),
  );

  const recordFilters = useMemo(() => {
    return currentRecordFilters.filter(
      (recordFilter) =>
        !recordFilter.recordFilterGroupId &&
        !checkIsSoftDeleteFilter(recordFilter),
    );
  }, [currentRecordFilters, checkIsSoftDeleteFilter]);

  const { applyCurrentViewFilterGroupsToCurrentRecordFilterGroups } =
    useApplyCurrentViewFilterGroupsToCurrentRecordFilterGroups();

  const { applyCurrentViewFiltersToCurrentRecordFilters } =
    useApplyCurrentViewFiltersToCurrentRecordFilters();

  const { applyCurrentViewSortsToCurrentRecordSorts } =
    useApplyCurrentViewSortsToCurrentRecordSorts();

  const handleCancelClick = () => {
    applyCurrentViewFilterGroupsToCurrentRecordFilterGroups();
    applyCurrentViewFiltersToCurrentRecordFilters();
    applyCurrentViewSortsToCurrentRecordSorts();
    toggleSoftDeleteFilterState(false);
  };

  const shouldExpandViewBar =
    viewFiltersAreDifferentFromRecordFilters ||
    viewSortsAreDifferentFromRecordSorts ||
    viewFilterGroupsAreDifferentFromRecordFilterGroups ||
    ((currentRecordSorts.length > 0 ||
      currentRecordFilters.length > 0 ||
      currentRecordFilterGroups.length > 0) &&
      isViewBarExpanded);

  if (!shouldExpandViewBar) {
    return null;
  }

  const shouldShowAdvancedFilterDropdownButton =
    currentRecordFilterGroups.length > 0;

  return (
    <StyledBar>
      <StyledFilterContainer>
        <ScrollWrapper
          componentInstanceId={viewBarId}
          defaultEnableYScroll={false}
        >
          <StyledChipContainer>
            {isDefined(softDeleteFilter) && (
              <SoftDeleteFilterChip
                key={softDeleteFilter.fieldMetadataId}
                recordFilter={softDeleteFilter}
                viewBarId={viewBarId}
              />
            )}
            {isDefined(softDeleteFilter) && (
              <StyledSeperatorContainer>
                <StyledSeperator />
              </StyledSeperatorContainer>
            )}
            {currentRecordSorts.map((recordSort) => (
              <EditableSortChip
                key={recordSort.fieldMetadataId}
                recordSort={recordSort}
              />
            ))}
            {isNonEmptyArray(recordFilters) &&
              isNonEmptyArray(currentRecordSorts) && (
                <StyledSeperatorContainer>
                  <StyledSeperator />
                </StyledSeperatorContainer>
              )}
            {shouldShowAdvancedFilterDropdownButton && (
              <AdvancedFilterDropdownButton />
            )}
            {recordFilters.map((recordFilter) => (
              <ObjectFilterDropdownComponentInstanceContext.Provider
                key={recordFilter.id}
                value={{ instanceId: recordFilter.id }}
              >
                <DropdownScope dropdownScopeId={recordFilter.id}>
                  <ViewBarFilterEffect filterDropdownId={recordFilter.id} />
                  <EditableFilterDropdownButton
                    recordFilter={recordFilter}
                    hotkeyScope={{
                      scope: recordFilter.id,
                    }}
                  />
                </DropdownScope>
              </ObjectFilterDropdownComponentInstanceContext.Provider>
            ))}
          </StyledChipContainer>
        </ScrollWrapper>
        {hasFilterButton && (
          <StyledAddFilterContainer>
            <AddObjectFilterFromDetailsButton
              filterDropdownId={filterDropdownId}
            />
          </StyledAddFilterContainer>
        )}
      </StyledFilterContainer>
      <StyledActionButtonContainer>
        {canResetView && (
          <LightButton
            data-testid="cancel-button"
            accent="tertiary"
            title={t`Reset`}
            onClick={handleCancelClick}
          />
        )}
        {rightComponent}
      </StyledActionButtonContainer>
    </StyledBar>
  );
};
