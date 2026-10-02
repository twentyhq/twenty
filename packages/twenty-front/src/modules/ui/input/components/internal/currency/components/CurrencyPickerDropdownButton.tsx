import { t } from '@lingui/core/macro';
import { useId } from 'react';
import { CurrencyCode } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';
import { CurrencyPicker } from 'twenty-ui/components';

import { CURRENCIES } from '@/settings/data-model/constants/Currencies';
import { CURRENCY_PICKER_CURRENCIES } from '@/ui/input/components/internal/currency/constants/CurrencyPickerCurrencies';
import { type Currency } from '@/ui/input/components/internal/types/Currency';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';

type CurrencyPickerDropdownButtonProps = {
  selectedCurrencyCode: string;
  onChange: (currency: Currency) => void;
};

export const CurrencyPickerDropdownButton = ({
  selectedCurrencyCode,
  onChange,
}: CurrencyPickerDropdownButtonProps) => {
  const dropdownId = useId();
  const currency = CURRENCIES.find(
    ({ value }) => value === selectedCurrencyCode,
  );
  const currencyCode = currency?.value ?? CurrencyCode.USD;

  const handleValueChange = (code: string) => {
    const selectedCurrency = CURRENCIES.find(({ value }) => value === code);

    if (isDefined(selectedCurrency)) {
      onChange(selectedCurrency);
    }
  };

  return (
    <DropdownRoot dropdownId={dropdownId} type="picker">
      <CurrencyPicker.Trigger value={currencyCode} />
      <DropdownContent
        side="bottom"
        align="start"
        sideOffset={4}
        alignOffset={0}
        aria-label={t`Currency`}
      >
        <CurrencyPicker.Options
          currencies={CURRENCY_PICKER_CURRENCIES}
          value={currency?.value}
          onValueChange={handleValueChange}
          searchLabel={t`Search`}
          emptyLabel={t`No results`}
        />
      </DropdownContent>
    </DropdownRoot>
  );
};
