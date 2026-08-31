import { ObjectFilterDropdownComponentInstanceContext } from '@/object-record/object-filter-dropdown/states/contexts/ObjectFilterDropdownComponentInstanceContext';
import { ObjectSortDropdownButton } from '@/object-record/object-sort-dropdown/components/ObjectSortDropdownButton';
import { ObjectSortDropdownComponentInstanceContext } from '@/object-record/object-sort-dropdown/states/context/ObjectSortDropdownComponentInstanceContext';
import { useIsPageLayoutInEditMode } from '@/page-layout/hooks/useIsPageLayoutInEditMode';
import { ViewBarDetails } from '@/views/components/ViewBarDetails';
import { ViewBarFilterDropdown } from '@/views/components/ViewBarFilterDropdown';
import {
  ViewBarFilterDropdownIdsContext,
  type ViewBarFilterDropdownIdsContextValue,
} from '@/views/contexts/ViewBarFilterDropdownIdsContext';
import { styled } from '@linaria/react';
import { useMemo } from 'react';
import { type ViewerControlsConfiguration } from 'twenty-shared/types';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type RecordTableWidgetSessionViewControlsProps = {
  objectNamePlural: string;
  recordIndexId: string;
  viewerControls?: ViewerControlsConfiguration;
};

const StyledControlsContainer = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  flex-shrink: 0;
  margin-left: ${themeCssVariables.spacing[3]};
`;

const StyledButtonRow = styled.div`
  align-items: center;
  display: flex;
  font-weight: ${themeCssVariables.font.weight.regular};
  gap: ${themeCssVariables.betweenSiblingsGap};
  height: 39px;
  justify-content: flex-end;
  padding-right: ${themeCssVariables.spacing[2]};
`;

export const RecordTableWidgetSessionViewControls = ({
  objectNamePlural,
  recordIndexId,
  viewerControls,
}: RecordTableWidgetSessionViewControlsProps) => {
  const isPageLayoutInEditMode = useIsPageLayoutInEditMode();
  const isFilterControlEnabled = viewerControls?.filter ?? false;
  const isSortControlEnabled = viewerControls?.sort ?? false;

  const componentIdPrefix = `record-table-widget-view-controls-${recordIndexId}`;

  const viewBarFilterDropdownIds = useMemo(
    (): ViewBarFilterDropdownIdsContextValue => ({
      mainDropdownId: `${componentIdPrefix}-filter`,
      advancedDropdownId: `${componentIdPrefix}-advanced-filter`,
      anyFieldSearchDropdownId: `${componentIdPrefix}-any-field-search`,
      filterFieldListId: `${componentIdPrefix}-filter-field-list`,
      filterFieldSelectMenuScrollId: `${componentIdPrefix}-filter-field-select-menu`,
      dropdownIdScope: componentIdPrefix,
    }),
    [componentIdPrefix],
  );

  if (
    isPageLayoutInEditMode ||
    (!isFilterControlEnabled && !isSortControlEnabled)
  ) {
    return null;
  }

  return (
    <ObjectSortDropdownComponentInstanceContext.Provider
      value={{ instanceId: `${componentIdPrefix}-object-sort` }}
    >
      <ObjectFilterDropdownComponentInstanceContext.Provider
        value={{ instanceId: viewBarFilterDropdownIds.mainDropdownId }}
      >
        <ViewBarFilterDropdownIdsContext.Provider
          value={viewBarFilterDropdownIds}
        >
          <StyledControlsContainer>
            <StyledButtonRow>
              {isFilterControlEnabled && <ViewBarFilterDropdown />}
              {isSortControlEnabled && (
                <ObjectSortDropdownButton
                  dropdownId={`${componentIdPrefix}-sort`}
                />
              )}
            </StyledButtonRow>
            <ViewBarDetails
              hasFilterButton={isFilterControlEnabled}
              objectNamePlural={objectNamePlural}
              shouldShowFilters={isFilterControlEnabled}
              shouldShowSorts={isSortControlEnabled}
              shouldIgnoreQueryParamsFilters
              viewBarId={recordIndexId}
            />
          </StyledControlsContainer>
        </ViewBarFilterDropdownIdsContext.Provider>
      </ObjectFilterDropdownComponentInstanceContext.Provider>
    </ObjectSortDropdownComponentInstanceContext.Provider>
  );
};
