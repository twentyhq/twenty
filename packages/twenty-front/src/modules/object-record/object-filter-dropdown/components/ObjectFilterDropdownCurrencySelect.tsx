import { ListItem } from 'twenty-ui/primitives/navigation';
import { useApplyObjectFilterDropdownFilterValue } from '@/object-record/object-filter-dropdown/hooks/useApplyObjectFilterDropdownFilterValue';
import { fieldMetadataItemUsedInDropdownComponentSelector } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemUsedInDropdownComponentSelector';
import { objectFilterDropdownCurrentRecordFilterComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownCurrentRecordFilterComponentState';
import { getCurrencyFilterDisplayValue } from '@/object-record/object-filter-dropdown/utils/getCurrencyFilterDisplayValue';
import { turnCurrencyIntoSelectableItem } from '@/object-record/object-filter-dropdown/utils/turnCurrencyIntoSelectableItem';
import { type SelectableItem } from '@/object-record/select/types/SelectableItem';
import { CURRENCIES } from '@/settings/data-model/constants/Currencies';
import { LegacyDropdownContent } from '@/ui/layout/dropdown/components/LegacyDropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useCurrencies } from '@/ui/input/components/internal/hooks/useCurrencies';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { type ChangeEvent, useState } from 'react';
import { isDefined, parseJson } from 'twenty-shared/utils';
import { z } from 'zod';

export const EMPTY_FILTER_VALUE = '[]';

export const ObjectFilterDropdownCurrencySelect = () => {
  const [searchText, setSearchText] = useState('');

  const objectFilterDropdownCurrentRecordFilter = useAtomComponentStateValue(
    objectFilterDropdownCurrentRecordFilterComponentState,
  );

  const { applyObjectFilterDropdownFilterValue } =
    useApplyObjectFilterDropdownFilterValue();

  const fieldMetadataItemUsedInFilterDropdown = useAtomComponentSelectorValue(
    fieldMetadataItemUsedInDropdownComponentSelector,
  );

  const currencies = useCurrencies();

  const currenciesAsSelectableItems = currencies.map(
    turnCurrencyIntoSelectableItem,
  );

  const selectedCurrencies = isNonEmptyString(
    objectFilterDropdownCurrentRecordFilter?.value,
  )
    ? (z
        .array(z.string())
        .safeParse(parseJson(objectFilterDropdownCurrentRecordFilter.value))
        .data ?? [])
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

    // A view saves the display value, so it keeps the English currency names
    const selectedItemNames = CURRENCIES.filter((currency) =>
      newSelectedItemIds.includes(currency.value),
    ).map((currency) => currency.label);

    const filterDisplayValue = getCurrencyFilterDisplayValue(selectedItemNames);

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
    <LegacyDropdownContent
      widthInPixels={GenericDropdownContentWidth.ExtraLarge}
    >
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
      <DropdownMenuItemsContainer isMultiSelect hasMaxHeight>
        {filteredSelectedItems?.map((item) => {
          return (
            <ListItem
              render={<button type="button" />}
              key={item.id}
              role="option"
              aria-selected={true}
              selected={true}
              indicator="checkbox"
              onClick={() => {
                handleMultipleItemSelectChange(item, false);
              }}
              startIcon={item.AvatarIcon && <item.AvatarIcon size="16" />}
            >
              {item.name}
            </ListItem>
          );
        })}
        {filteredSelectableItems?.map((item) => {
          return (
            <ListItem
              render={<button type="button" />}
              key={item.id}
              role="option"
              aria-selected={false}
              selected={false}
              indicator="checkbox"
              onClick={() => {
                handleMultipleItemSelectChange(item, true);
              }}
              startIcon={item.AvatarIcon && <item.AvatarIcon size="16" />}
            >
              {item.name}
            </ListItem>
          );
        })}
        {showNoResult && <ListItem disabled>{t`No results`}</ListItem>}
      </DropdownMenuItemsContainer>
    </LegacyDropdownContent>
  );
};
