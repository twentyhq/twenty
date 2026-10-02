import { useState, type ComponentProps } from 'react';

import { CurrencyPickerDropdownButton } from '@/ui/input/components/internal/currency/components/CurrencyPickerDropdownButton';

type CurrencyPickerDropdownButtonExampleProps = ComponentProps<
  typeof CurrencyPickerDropdownButton
>;

export const CurrencyPickerDropdownButtonExample = ({
  selectedCurrencyCode,
  onChange,
}: CurrencyPickerDropdownButtonExampleProps) => {
  const [currencyCode, setCurrencyCode] = useState(selectedCurrencyCode);

  return (
    <CurrencyPickerDropdownButton
      selectedCurrencyCode={currencyCode}
      onChange={(newCurrencyCode) => {
        setCurrencyCode(newCurrencyCode);
        onChange(newCurrencyCode);
      }}
    />
  );
};
