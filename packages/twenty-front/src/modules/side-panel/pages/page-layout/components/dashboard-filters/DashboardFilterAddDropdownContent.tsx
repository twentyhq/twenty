import { useDashboardFilterCandidateDimensions } from '@/page-layout/dashboard-filters/hooks/useDashboardFilterCandidateDimensions';
import { useDashboardFilterEditorActions } from '@/page-layout/dashboard-filters/hooks/useDashboardFilterEditorActions';
import { type DashboardFilterCandidateDimension } from '@/page-layout/dashboard-filters/types/DashboardFilterCandidateDimension';
import {
  StyledPageLayoutDropdownContentContainer,
  StyledPageLayoutDropdownMenuItemsContainer,
} from '@/side-panel/pages/page-layout/components/dropdown-content/PageLayoutDropdownContentContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { DropdownComponentInstanceContext } from '@/ui/layout/dropdown/contexts/DropdownComponentInstanceContext';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { plural, t } from '@lingui/core/macro';
import { useState } from 'react';
import { ListItem } from 'twenty-ui/primitives/navigation';
import { filterBySearchQuery } from '~/utils/filterBySearchQuery';

type DashboardFilterAddDropdownContentProps = {
  pageLayoutId: string;
  onDimensionAdded: (slotId: string) => void;
};

export const DashboardFilterAddDropdownContent = ({
  pageLayoutId,
  onDimensionAdded,
}: DashboardFilterAddDropdownContentProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const candidateDimensions =
    useDashboardFilterCandidateDimensions(pageLayoutId);

  const { addCandidateDimension } =
    useDashboardFilterEditorActions(pageLayoutId);

  const dropdownId = useAvailableComponentInstanceIdOrThrow(
    DropdownComponentInstanceContext,
  );

  const selectedItemId = useAtomComponentStateValue(
    selectedItemIdComponentState,
    dropdownId,
  );

  const { closeDropdown } = useCloseDropdown();

  const visibleDimensions = filterBySearchQuery({
    items: candidateDimensions,
    searchQuery,
    getSearchableValues: (dimension) => [dimension.label],
  });

  const handleSelectDimension = (
    dimension: DashboardFilterCandidateDimension,
  ) => {
    const slotId = addCandidateDimension(dimension);

    closeDropdown();
    onDimensionAdded(slotId);
  };

  const getDimensionDescription = (
    dimension: DashboardFilterCandidateDimension,
  ) => {
    const chartCountLabel = t`${dimension.boundChartCount} of ${plural(
      dimension.chartCount,
      { one: '# chart', other: '# charts' },
    )}`;

    return dimension.isBuiltIn === true
      ? t`Built-in · ${chartCountLabel}`
      : chartCountLabel;
  };

  return (
    <StyledPageLayoutDropdownContentContainer>
      <DropdownMenuSearchInput
        autoFocus
        type="text"
        placeholder={t`Search filters`}
        onChange={(event) => setSearchQuery(event.target.value)}
        value={searchQuery}
      />
      <DropdownMenuSeparator />
      <StyledPageLayoutDropdownMenuItemsContainer>
        {visibleDimensions.length === 0 ? (
          <ListItem disabled>{t`No filterable field found`}</ListItem>
        ) : (
          <SelectableList
            selectableListInstanceId={dropdownId}
            focusId={dropdownId}
            selectableItemIdArray={visibleDimensions.map(
              (dimension) => dimension.id,
            )}
          >
            {visibleDimensions.map((dimension) => (
              <SelectableListItem
                key={dimension.id}
                itemId={dimension.id}
                onEnter={() => handleSelectDimension(dimension)}
              >
                <ListItem
                  focused={selectedItemId === dimension.id}
                  onClick={() => handleSelectDimension(dimension)}
                  description={getDimensionDescription(dimension)}
                  descriptionPlacement="end"
                >
                  {dimension.label}
                </ListItem>
              </SelectableListItem>
            ))}
          </SelectableList>
        )}
      </StyledPageLayoutDropdownMenuItemsContainer>
    </StyledPageLayoutDropdownContentContainer>
  );
};
