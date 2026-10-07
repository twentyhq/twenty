import { useDashboardFilterCandidateDimensions } from '@/page-layout/dashboard-filters/hooks/useDashboardFilterCandidateDimensions';
import { type DashboardFilterCandidateDimension } from '@/page-layout/dashboard-filters/types/DashboardFilterCandidateDimension';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import {
  StyledPageLayoutDropdownContentContainer,
  StyledPageLayoutDropdownMenuItemsContainer,
} from '@/side-panel/pages/page-layout/components/dropdown-content/PageLayoutDropdownContentContainer';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { DropdownComponentInstanceContext } from '@/ui/layout/dropdown/contexts/DropdownComponentInstanceContext';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { useIcons } from 'twenty-ui/icon';
import { ListItem } from 'twenty-ui/primitives/navigation';
import { WidgetType } from '~/generated-metadata/graphql';
import { filterBySearchQuery } from '~/utils/filterBySearchQuery';

type DashboardFilterCandidateDimensionsDropdownContentProps = {
  pageLayoutId: string;
  onDimensionSelect: (dimension: DashboardFilterCandidateDimension) => void;
};

export const DashboardFilterCandidateDimensionsDropdownContent = ({
  pageLayoutId,
  onDimensionSelect,
}: DashboardFilterCandidateDimensionsDropdownContentProps) => {
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const [searchQuery, setSearchQuery] = useState('');

  const dimensions = useDashboardFilterCandidateDimensions(pageLayoutId);

  const pageLayoutDraft = useAtomComponentStateValue(
    pageLayoutDraftComponentState,
    pageLayoutId,
  );

  const graphWidgetCount = pageLayoutDraft.tabs
    .flatMap((tab) => tab.widgets)
    .filter((widget) => widget.type === WidgetType.GRAPH).length;

  const dropdownId = useAvailableComponentInstanceIdOrThrow(
    DropdownComponentInstanceContext,
  );

  const selectedItemId = useAtomComponentStateValue(
    selectedItemIdComponentState,
    dropdownId,
  );

  const { closeDropdown } = useCloseDropdown();

  const visibleDimensions = filterBySearchQuery({
    items: dimensions,
    searchQuery,
    getSearchableValues: (dimension) => [dimension.label],
  });

  const handleSelect = (dimension: DashboardFilterCandidateDimension) => {
    closeDropdown();
    onDimensionSelect(dimension);
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
        <SelectableList
          selectableListInstanceId={dropdownId}
          focusId={dropdownId}
          selectableItemIdArray={visibleDimensions.map(
            (dimension) => dimension.key,
          )}
        >
          {visibleDimensions.length === 0 ? (
            <ListItem disabled>{t`No filters available`}</ListItem>
          ) : (
            visibleDimensions.map((dimension) => {
              const boundWidgetCount = Object.keys(
                dimension.proposedBindingsByWidgetId,
              ).length;

              return (
                <SelectableListItem
                  key={dimension.key}
                  itemId={dimension.key}
                  onEnter={() => handleSelect(dimension)}
                >
                  <ListItem
                    focused={selectedItemId === dimension.key}
                    onClick={() => handleSelect(dimension)}
                    role="option"
                    startIcon={
                      <SelectOptionIcon Icon={getIcon(dimension.icon)} />
                    }
                    description={t`${boundWidgetCount} of ${graphWidgetCount}`}
                    descriptionPlacement="end"
                  >
                    {dimension.label}
                  </ListItem>
                </SelectableListItem>
              );
            })
          )}
        </SelectableList>
      </StyledPageLayoutDropdownMenuItemsContainer>
    </StyledPageLayoutDropdownContentContainer>
  );
};
