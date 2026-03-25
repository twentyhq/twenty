import { t } from '@lingui/core/macro';
import { useMemo, useState } from 'react';

import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';

import { CURRENCIES } from '@/settings/data-model/constants/Currencies';
import { type Currency } from '@/ui/input/components/internal/types/Currency';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { MenuItem, MenuItemSelectAvatar } from 'twenty-ui/navigation';

export const CurrencyPickerDropdownSelect = ({
  selectedCurrency,
  onChange,
}: {
  selectedCurrency?: Currency;
  onChange: (currency: Currency) => void;
}) => {
  const [searchFilter, setSearchFilter] = useState<string>('');

  const filteredCurrencies = useMemo(
    () =>
      CURRENCIES.filter(
        ({ value, label }) =>
          value
            .toLocaleLowerCase()
            .includes(searchFilter.toLocaleLowerCase()) ||
          label.toLocaleLowerCase().includes(searchFilter.toLocaleLowerCase()),
      ),
    [searchFilter],
  );

  return (
    <DropdownContent>
      <DropdownMenuSearchInput
        value={searchFilter}
        onChange={(event) => setSearchFilter(event.target.value)}
        autoFocus
        role="combobox"
      />
      <DropdownMenuSeparator />
      <DropdownMenuItemsContainer hasMaxHeight>
        {filteredCurrencies.length === 0 ? (
          <MenuItem text={t`No results`} />
        ) : (
          <>
            {selectedCurrency && (
              <MenuItemSelectAvatar
                key={selectedCurrency.value}
                selected={true}
                onClick={() => onChange(selectedCurrency)}
                text={selectedCurrency.label}
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
    </DropdownContent>
  );
};
