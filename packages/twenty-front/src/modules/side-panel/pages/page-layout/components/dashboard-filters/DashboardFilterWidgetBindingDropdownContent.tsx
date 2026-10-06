import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type DashboardFilterBindingOption } from '@/page-layout/dashboard-filters/types/DashboardFilterBindingOption';
import { areDashboardFilterBindingsEqual } from '@/page-layout/dashboard-filters/utils/areDashboardFilterBindingsEqual';
import { listDashboardFilterBindingOptionsForWidget } from '@/page-layout/dashboard-filters/utils/listDashboardFilterBindingOptionsForWidget';
import {
  StyledPageLayoutDropdownContentContainer,
  StyledPageLayoutDropdownMenuItemsContainer,
} from '@/side-panel/pages/page-layout/components/dropdown-content/PageLayoutDropdownContentContainer';
import { type ChartWidget } from '@/side-panel/pages/page-layout/types/ChartWidget';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { DropdownComponentInstanceContext } from '@/ui/layout/dropdown/contexts/DropdownComponentInstanceContext';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { t } from '@lingui/core/macro';
import { useMemo, useState } from 'react';
import {
  type DashboardFilterBinding,
  type DashboardFilterSlot,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IconFilterOff } from 'twenty-ui/icon';
import { ListItem } from 'twenty-ui/primitives/navigation';
import { filterBySearchQuery } from '~/utils/filterBySearchQuery';

const NOT_APPLIED_OPTION_ID = 'not-applied';

type DashboardFilterWidgetBindingDropdownContentProps = {
  slot: DashboardFilterSlot;
  widget: ChartWidget;
  binding: DashboardFilterBinding | null;
  onBindingChange: (binding: DashboardFilterBinding | null) => void;
};

export const DashboardFilterWidgetBindingDropdownContent = ({
  slot,
  widget,
  binding,
  onBindingChange,
}: DashboardFilterWidgetBindingDropdownContentProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const { objectMetadataItems } = useObjectMetadataItems();

  const dropdownId = useAvailableComponentInstanceIdOrThrow(
    DropdownComponentInstanceContext,
  );

  const selectedItemId = useAtomComponentStateValue(
    selectedItemIdComponentState,
    dropdownId,
  );

  const { closeDropdown } = useCloseDropdown();

  const objectMetadataItem = objectMetadataItems.find(
    (candidateObjectMetadataItem) =>
      candidateObjectMetadataItem.id === widget.objectMetadataId,
  );

  const bindingOptions = useMemo(
    () =>
      isDefined(objectMetadataItem)
        ? listDashboardFilterBindingOptionsForWidget({
            slot,
            objectMetadataItem,
            objectMetadataItems,
          })
        : [],
    [slot, objectMetadataItem, objectMetadataItems],
  );

  const visibleOptions = filterBySearchQuery({
    items: bindingOptions,
    searchQuery,
    getSearchableValues: (option) => [option.label],
  });

  const handleSelect = (option: DashboardFilterBindingOption | null) => {
    onBindingChange(option?.binding ?? null);
    closeDropdown();
  };

  const isNotAppliedSelected = !isDefined(binding);

  return (
    <StyledPageLayoutDropdownContentContainer>
      <DropdownMenuSearchInput
        autoFocus
        type="text"
        placeholder={t`Search fields`}
        onChange={(event) => setSearchQuery(event.target.value)}
        value={searchQuery}
      />
      <DropdownMenuSeparator />
      <StyledPageLayoutDropdownMenuItemsContainer>
        <SelectableList
          selectableListInstanceId={dropdownId}
          focusId={dropdownId}
          selectableItemIdArray={[
            NOT_APPLIED_OPTION_ID,
            ...visibleOptions.map((option) => option.id),
          ]}
        >
          <SelectableListItem
            itemId={NOT_APPLIED_OPTION_ID}
            onEnter={() => handleSelect(null)}
          >
            <ListItem
              focused={selectedItemId === NOT_APPLIED_OPTION_ID}
              onClick={() => handleSelect(null)}
              role="option"
              aria-selected={isNotAppliedSelected}
              selected={isNotAppliedSelected}
              indicator="check"
              startIcon={<IconFilterOff />}
            >
              {t`Not applied`}
            </ListItem>
          </SelectableListItem>
          {visibleOptions.map((option) => {
            const isSelected = areDashboardFilterBindingsEqual(
              option.binding,
              binding,
            );

            return (
              <SelectableListItem
                key={option.id}
                itemId={option.id}
                onEnter={() => handleSelect(option)}
              >
                <ListItem
                  focused={selectedItemId === option.id}
                  onClick={() => handleSelect(option)}
                  role="option"
                  aria-selected={isSelected}
                  selected={isSelected}
                  indicator="check"
                >
                  {option.label}
                </ListItem>
              </SelectableListItem>
            );
          })}
        </SelectableList>
      </StyledPageLayoutDropdownMenuItemsContainer>
    </StyledPageLayoutDropdownContentContainer>
  );
};
