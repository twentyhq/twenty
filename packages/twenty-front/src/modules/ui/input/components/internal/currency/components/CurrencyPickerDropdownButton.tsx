import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { type KeyboardEvent, useId } from 'react';
import { CurrencyCode } from 'twenty-shared/constants';
import { CurrencyPicker } from 'twenty-ui/components/input';

import { useCurrencyPickerCurrencies } from '@/ui/input/components/internal/currency/hooks/useCurrencyPickerCurrencies';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';

type CurrencyPickerDropdownButtonProps = {
  selectedCurrencyCode?: string;
  onChange: (currencyCode: string) => void;
  disabled?: boolean;
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
  disabled,
}: CurrencyPickerDropdownButtonProps) => {
  const dropdownId = useId();
  const currencyPickerCurrencies = useCurrencyPickerCurrencies();
  const selectedCurrency = currencyPickerCurrencies.find(
    ({ code }) => code === selectedCurrencyCode,
  );
  const currencyCode = isNonEmptyString(selectedCurrencyCode)
    ? (selectedCurrency?.code ?? CurrencyCode.USD)
    : undefined;

  return (
    <DropdownRoot dropdownId={dropdownId} type="picker">
      <CurrencyPicker.Trigger
        value={currencyCode ?? t`Currency`}
        disabled={disabled}
        aria-label={
          isNonEmptyString(currencyCode)
            ? t`Currency: ${currencyCode}`
            : t`Currency`
        }
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
          currencies={currencyPickerCurrencies}
          value={selectedCurrency?.code}
          onValueChange={onChange}
          searchLabel={t`Search`}
          emptyLabel={t`No results`}
        />
      </DropdownContent>
    </DropdownRoot>
  );
};
