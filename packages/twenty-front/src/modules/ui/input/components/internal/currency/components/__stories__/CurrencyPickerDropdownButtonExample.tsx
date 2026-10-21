import { isNonEmptyString } from '@sniptt/guards';
import { useState, type ComponentProps } from 'react';
import { Button } from 'twenty-ui/primitives/input';
import { Text } from 'twenty-ui/primitives/typography';

import { CurrencyPickerDropdownButton } from '@/ui/input/components/internal/currency/components/CurrencyPickerDropdownButton';

type CurrencyPickerDropdownButtonExampleProps = ComponentProps<
  typeof CurrencyPickerDropdownButton
> & { showExternalUpdates?: boolean };

export const CurrencyPickerDropdownButtonExample = ({
  selectedCurrencyCode,
  onChange,
  showExternalUpdates = false,
}: CurrencyPickerDropdownButtonExampleProps) => {
  const [currencyCode, setCurrencyCode] = useState(selectedCurrencyCode);

  return (
    <>
      <CurrencyPickerDropdownButton
        selectedCurrencyCode={currencyCode}
        onChange={(newCurrencyCode) => {
          setCurrencyCode(newCurrencyCode);
          onChange(newCurrencyCode);
        }}
      />
      {showExternalUpdates && (
        <>
          <Button onClick={() => setCurrencyCode('EUR')}>Use EUR</Button>
          <Button onClick={() => setCurrencyCode('')}>Clear currency</Button>
          <Button onClick={() => setCurrencyCode('UNKNOWN')}>
            Use unknown currency
          </Button>
          <Text role="status">
            Stored currency:{' '}
            {isNonEmptyString(currencyCode) ? currencyCode : 'empty'}
          </Text>
        </>
      )}
    </>
  );
};
