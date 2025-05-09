import { useApplyObjectFilterDropdownFilterValue } from '@/object-record/object-filter-dropdown/hooks/useApplyObjectFilterDropdownFilterValue';
import { fieldMetadataItemUsedInDropdownComponentSelector } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemUsedInDropdownComponentSelector';
import { objectFilterDropdownCurrentRecordFilterComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownCurrentRecordFilterComponentState';
import { turnCurrencyIntoSelectableItem } from '@/object-record/object-filter-dropdown/utils/turnCurrencyIntoSelectableItem';
import { StyledMultipleSelectDropdownAvatarChip } from '@/object-record/select/components/StyledMultipleSelectDropdownAvatarChip';
import { SelectableItem } from '@/object-record/select/types/SelectableItem';
import { CURRENCIES } from '@/settings/data-model/constants/Currencies';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { ChangeEvent, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { MenuItem, MenuItemMultiSelectAvatar } from 'twenty-ui/navigation';

export const EMPTY_FILTER_VALUE = '[]';
export const MAX_ITEMS_TO_DISPLAY = 3;

type ObjectFilterDropdownCurrencySelectProps = {
  dropdownWidth?: number;
};

export const ObjectFilterDropdownCurrencySelect = ({
  dropdownWidth,
}: ObjectFilterDropdownCurrencySelectProps) => {
  const [searchText, setSearchText] = useState('');

  const objectFilterDropdownCurrentRecordFilter = useRecoilComponentValueV2(
    objectFilterDropdownCurrentRecordFilterComponentState,
  );

  const { applyObjectFilterDropdownFilterValue } =
    useApplyObjectFilterDropdownFilterValue();

  const fieldMetadataItemUsedInFilterDropdown = useRecoilComponentValueV2(
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
    <>
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
      <DropdownMenuItemsContainer hasMaxHeight width={dropdownWidth ?? 200}>
        {filteredSelectedItems?.map((item) => {
          return (
            <MenuItemMultiSelectAvatar
              key={item.id}
              selected={true}
              onSelectChange={(newCheckedValue) => {
                handleMultipleItemSelectChange(item, newCheckedValue);
              }}
              avatar={
                <StyledMultipleSelectDropdownAvatarChip
                  className="avatar-icon-container"
                  name={item.name}
                  avatarUrl={item.avatarUrl}
                  LeftIcon={item.AvatarIcon}
                  avatarType={item.avatarType}
                  isIconInverted={item.isIconInverted}
                  placeholderColorSeed={item.id}
                />
              }
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
              avatar={
                <StyledMultipleSelectDropdownAvatarChip
                  className="avatar-icon-container"
                  name={item.name}
                  avatarUrl={item.avatarUrl}
                  LeftIcon={item.AvatarIcon}
                  avatarType={item.avatarType}
                  isIconInverted={item.isIconInverted}
                  placeholderColorSeed={item.id}
                />
              }
            />
          );
        })}
        {showNoResult && <MenuItem text={t`No results`} />}
      </DropdownMenuItemsContainer>
    </>
  );
};
