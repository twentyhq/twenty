import { DropdownListItem } from '@/ui/layout/dropdown/components/DropdownListItem';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/surfaces';
import { t } from '@lingui/core/macro';
import { useMemo, useState } from 'react';

import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';

import { CURRENCIES } from '@/settings/data-model/constants/Currencies';
import { type Currency } from '@/ui/input/components/internal/types/Currency';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';

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
          <DropdownListItem disabled>{t`No results`}</DropdownListItem>
        ) : (
          <>
            {selectedCurrency && (
              <DropdownListItem
                key={selectedCurrency.value}
                onClick={() => onChange(selectedCurrency)}
                role="option"
                aria-selected={true}
                selected={true}
                indicator="check"
              >
                {selectedCurrency.label}
              </DropdownListItem>
            )}
            {filteredCurrencies.map((item) =>
              selectedCurrency?.value === item.value ? null : (
                <DropdownListItem
                  key={item.value}
                  onClick={() => onChange(item)}
                  role="option"
                  aria-selected={selectedCurrency?.value === item.value}
                  selected={selectedCurrency?.value === item.value}
                  indicator="check"
                >
                  <OverflowingTextWithTooltip
                    text={`${item.label} (${item.value})`}
                  />
                </DropdownListItem>
              ),
            )}
          </>
        )}
      </DropdownMenuItemsContainer>
    </DropdownContent>
  );
};
