import { CURRENCIES } from '@/settings/data-model/constants/Currencies';
import { type Currency } from '@/ui/input/components/internal/types/Currency';
import { DROPDOWN_MENU_ITEMS_CONTAINER_MAX_HEIGHT } from '@/ui/layout/dropdown/constants/DropdownMenuItemsContainerMaxHeight';
import { t } from '@lingui/core/macro';
import { useMemo, useState } from 'react';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';

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
    <>
      <Dropdown.Search
        value={searchFilter}
        placeholder={t`Search`}
        aria-label={t`Search`}
        onValueChange={setSearchFilter}
      />
      <Dropdown.Separator />
      <Dropdown.Section
        style={{
          maxHeight: DROPDOWN_MENU_ITEMS_CONTAINER_MAX_HEIGHT,
          overflowY: 'auto',
        }}
      >
        {!isNonEmptyArray(filteredCurrencies) ? (
          <Dropdown.Empty>{t`No results`}</Dropdown.Empty>
        ) : (
          <>
            {isDefined(selectedCurrency) && (
              <Dropdown.OptionItem
                key={selectedCurrency.value}
                onSelect={() => onChange(selectedCurrency)}
                selected={true}
              >
                {selectedCurrency.label}
              </Dropdown.OptionItem>
            )}
            {filteredCurrencies.map((item) =>
              selectedCurrency?.value === item.value ? null : (
                <Dropdown.OptionItem
                  key={item.value}
                  onSelect={() => onChange(item)}
                  selected={selectedCurrency?.value === item.value}
                >
                  <OverflowingTextWithTooltip
                    text={`${item.label} (${item.value})`}
                  />
                </Dropdown.OptionItem>
              ),
            )}
          </>
        )}
      </Dropdown.Section>
    </>
  );
};
