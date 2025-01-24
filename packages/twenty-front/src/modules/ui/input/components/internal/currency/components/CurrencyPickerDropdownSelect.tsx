import { useMemo, useState } from 'react';

import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';

import { MenuItem, MenuItemSelectAvatar } from 'twenty-ui';
import { Currency } from './CurrencyPickerDropdownButton';

export const CurrencyPickerDropdownSelect = ({
  currencies,
  selectedCurrency,
  onChange,
}: {
  currencies: Currency[];
  selectedCurrency?: Currency;
  onChange: (currency: Currency) => void;
}) => {
  const [searchFilter, setSearchFilter] = useState<string>('');

  const filteredCurrencies = useMemo(
    () =>
      currencies.filter(
        ({ value, label }) =>
          value
            .toLocaleLowerCase()
            .includes(searchFilter.toLocaleLowerCase()) ||
          label.toLocaleLowerCase().includes(searchFilter.toLocaleLowerCase()),
      ),
    [currencies, searchFilter],
  );

  return (
    <DropdownMenu>
      <DropdownMenuSearchInput
        value={searchFilter}
        onChange={(event) => setSearchFilter(event.target.value)}
        autoFocus
        role="combobox"
      />
      <DropdownMenuSeparator />
      <DropdownMenuItemsContainer hasMaxHeight>
        {filteredCurrencies.length === 0 ? (
          <MenuItem text="No result" />
        ) : (
          <>
            {selectedCurrency && (
              <MenuItemSelectAvatar
                key={selectedCurrency.value}
                selected={true}
                onClick={() => onChange(selectedCurrency)}
                text={`${selectedCurrency.label} (${selectedCurrency.value})`}
              />
            )}
            {filteredCurrencies.map((item) =>
              selectedCurrency?.value === item.value ? null : (
                <MenuItemSelectAvatar
                  key={item.value}
                  selected={selectedCurrency?.value === item.value}
                  onClick={() => onChange(item)}
                  text={`${item.label} (${item.value})`}
                />
              ),
            )}
          </>
        )}
      </DropdownMenuItemsContainer>
    </DropdownMenu>
  );
};
