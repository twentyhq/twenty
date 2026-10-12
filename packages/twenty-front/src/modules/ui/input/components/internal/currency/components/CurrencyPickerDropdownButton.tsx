import { t } from '@lingui/core/macro';
import { type KeyboardEvent, useId } from 'react';
import { CurrencyCode } from 'twenty-shared/constants';
import { CurrencyPicker } from 'twenty-ui/components/input';

import { CURRENCY_PICKER_CURRENCIES } from '@/ui/input/components/internal/currency/constants/CurrencyPickerCurrencies';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';

type CurrencyPickerDropdownButtonProps = {
  selectedCurrencyCode: string;
  onChange: (currencyCode: string) => void;
};

const keepEnterAwayFromFieldHotkeys = (
  event: KeyboardEvent<HTMLButtonElement>,
) => {
  if (event.key !== 'Enter') {
    return;
  }

  event.stopPropagation();
};

export const CurrencyPickerDropdownButton = ({
  selectedCurrencyCode,
  onChange,
}: CurrencyPickerDropdownButtonProps) => {
  const dropdownId = useId();
  const selectedCurrency = CURRENCY_PICKER_CURRENCIES.find(
    ({ code }) => code === selectedCurrencyCode,
  );
  const currencyCode = selectedCurrency?.code ?? CurrencyCode.USD;

  return (
    <DropdownRoot dropdownId={dropdownId} type="picker">
      <CurrencyPicker.Trigger
        value={currencyCode}
        aria-label={t`Currency: ${currencyCode}`}
        onKeyDown={keepEnterAwayFromFieldHotkeys}
      />
      <DropdownContent
        side="bottom"
        align="start"
        sideOffset={4}
        alignOffset={0}
        aria-label={t`Currency`}
      >
        <CurrencyPicker.Options
          currencies={CURRENCY_PICKER_CURRENCIES}
          value={selectedCurrency?.code}
          onValueChange={onChange}
          searchLabel={t`Search`}
          emptyLabel={t`No results`}
        />
      </DropdownContent>
    </DropdownRoot>
  );
};
