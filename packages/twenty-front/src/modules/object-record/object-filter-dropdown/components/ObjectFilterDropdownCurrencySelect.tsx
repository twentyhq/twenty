import { useApplyObjectFilterDropdownFilterValue } from '@/object-record/object-filter-dropdown/hooks/useApplyObjectFilterDropdownFilterValue';
import { fieldMetadataItemUsedInDropdownComponentSelector } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemUsedInDropdownComponentSelector';
import { objectFilterDropdownCurrentRecordFilterComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownCurrentRecordFilterComponentState';
import { turnCurrencyIntoSelectableItem } from '@/object-record/object-filter-dropdown/utils/turnCurrencyIntoSelectableItem';
import { SelectableItem } from '@/object-record/select/types/SelectableItem';
import { CURRENCIES } from '@/settings/data-model/constants/Currencies';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { ChangeEvent, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { MenuItem, MenuItemMultiSelectAvatar } from 'twenty-ui/navigation';

export const EMPTY_FILTER_VALUE = '[]';
export const MAX_ITEMS_TO_DISPLAY = 3;

export const ObjectFilterDropdownCurrencySelect = () => {
  const [searchText, setSearchText] = useState('');

  const objectFilterDropdownCurrentRecordFilter = useRecoilComponentValue(
    objectFilterDropdownCurrentRecordFilterComponentState,
  );

  const { applyObjectFilterDropdownFilterValue } =
    useApplyObjectFilterDropdownFilterValue();

  const fieldMetadataItemUsedInFilterDropdown = useRecoilComponentValue(
    fieldMetadataItemUsedInDropdownComponentSelector,
  );

  const currenciesAsSelectableItems = CURRENCIES.map(
    turnCurrencyIntoSelectableItem,
  );

  const selectedCurrencies = isNonEmptyString(
    objectFilterDropdownCurrentRecordFilter?.value,
  )
    ? (JSON.parse(objectFilterDropdownCurrentRecordFilter.value) as string[]) // TODO: replace by a safe parse
    : [];

  const filteredSelectableItems = currenciesAsSelectableItems.filter(
    (selectableItem) =>
      selectableItem.name.toLowerCase().includes(searchText.toLowerCase()) &&
      !selectedCurrencies.includes(selectableItem.id),
  );

  const filteredSelectedItems = currenciesAsSelectableItems.filter(
    (selectableItem) =>
      selectableItem.name.toLowerCase().includes(searchText.toLowerCase()) &&
      selectedCurrencies.includes(selectableItem.id),
  );

  const { t } = useLingui();

  const handleMultipleItemSelectChange = (
    itemToSelect: SelectableItem,
    newSelectedValue: boolean,
  ) => {
    const newSelectedItemIds = newSelectedValue
      ? [...selectedCurrencies, itemToSelect.id]
      : selectedCurrencies.filter((id) => id !== itemToSelect.id);

    if (!isDefined(fieldMetadataItemUsedInFilterDropdown)) {
      throw new Error(
        'Field metadata item used in filter dropdown should be defined',
      );
    }

    const selectedItemNames = currenciesAsSelectableItems
      .filter((option) => newSelectedItemIds.includes(option.id))
      .map((option) => option.name);

    const currenciesLabel = t`currencies`;

    const filterDisplayValue =
      selectedItemNames.length > MAX_ITEMS_TO_DISPLAY
        ? `${selectedItemNames.length} ${currenciesLabel}`
        : selectedItemNames.join(', ');

    const newFilterValue =
      newSelectedItemIds.length > 0
        ? JSON.stringify(newSelectedItemIds)
        : EMPTY_FILTER_VALUE;

    applyObjectFilterDropdownFilterValue(newFilterValue, filterDisplayValue);
  };

  const showNoResult =
    filteredSelectableItems.length === 0 &&
    filteredSelectedItems.length === 0 &&
    searchText !== '';

  return (
    <DropdownContent widthInPixels={GenericDropdownContentWidth.ExtraLarge}>
      <DropdownMenuSearchInput
        autoFocus
        type="text"
        value={searchText}
        placeholder={t`Search currency`}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          setSearchText(event.target.value);
        }}
      />
      <DropdownMenuSeparator />
      <DropdownMenuItemsContainer hasMaxHeight>
        {filteredSelectedItems?.map((item) => {
          return (
            <MenuItemMultiSelectAvatar
              key={item.id}
              selected={true}
              onSelectChange={(newCheckedValue) => {
                handleMultipleItemSelectChange(item, newCheckedValue);
              }}
              text={item.name}
              avatar={item.AvatarIcon && <item.AvatarIcon size="16" />}
            />
          );
        })}
        {filteredSelectableItems?.map((item) => {
          return (
            <MenuItemMultiSelectAvatar
              key={item.id}
              selected={false}
              onSelectChange={(newCheckedValue) => {
                handleMultipleItemSelectChange(item, newCheckedValue);
              }}
              text={item.name}
              avatar={item.AvatarIcon && <item.AvatarIcon size="16" />}
            />
          );
        })}
        {showNoResult && <MenuItem text={t`No results`} />}
      </DropdownMenuItemsContainer>
    </DropdownContent>
  );
};
