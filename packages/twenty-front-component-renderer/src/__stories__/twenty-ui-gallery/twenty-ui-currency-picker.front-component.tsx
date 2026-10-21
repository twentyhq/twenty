import { useRef, useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { CurrencyPicker } from 'twenty-ui/components/input';
import { Dropdown } from 'twenty-ui/components/navigation';
import { Button } from 'twenty-ui/primitives/input';
import { Text } from 'twenty-ui/primitives/typography';

import { TwentyUiGalleryCard } from '@/__stories__/shared/front-components/twenty-ui-gallery-card';

const CURRENCIES = [
  { code: 'CAD', name: 'Canadian Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', disabled: true },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
];

const CurrencyPickerExample = () => {
  const [primaryCurrency, setPrimaryCurrency] = useState<string | null>('EUR');
  const [secondaryCurrency, setSecondaryCurrency] = useState<string | null>(
    'USD',
  );

  const [primaryChanges, setPrimaryChanges] = useState(0);
  const [primaryReason, setPrimaryReason] = useState('none');
  const [primaryTriggerTarget, setPrimaryTriggerTarget] = useState('unread');
  const primaryTriggerRef = useRef<HTMLButtonElement>(null);

  return (
    <TwentyUiGalleryCard title="Currency picker">
      <CurrencyPicker
        currencies={CURRENCIES}
        data-currency-trigger="primary"
        value={primaryCurrency}
        onValueChange={(currencyCode, details) => {
          setPrimaryCurrency(currencyCode);
          setPrimaryChanges((count) => count + 1);
          setPrimaryReason(details.reason);
          setPrimaryTriggerTarget(
            primaryTriggerRef.current?.getAttribute('data-currency-trigger') ??
              'missing',
          );
        }}
        renderValue={({ selectedCurrency }) => selectedCurrency?.code ?? 'None'}
        triggerProps={{
          'aria-label': 'Primary currency',
          ref: primaryTriggerRef,
        }}
        contentProps={{ 'aria-label': 'Primary currencies' }}
        optionsProps={{
          searchLabel: 'Search primary currencies',
          emptyLabel: 'No matching currencies',
        }}
      />
      <Dropdown.Root type="picker">
        <CurrencyPicker.Root
          currencies={CURRENCIES}
          value={secondaryCurrency}
          onValueChange={setSecondaryCurrency}
        >
          <CurrencyPicker.Trigger aria-label="Secondary currency" />
          <Dropdown.Content aria-label="Secondary currencies">
            <CurrencyPicker.Options
              searchLabel="Search secondary currencies"
              emptyLabel="No matching currencies"
            />
          </Dropdown.Content>
        </CurrencyPicker.Root>
      </Dropdown.Root>
      <CurrencyPicker
        currencies={CURRENCIES}
        defaultValue="EUR"
        disabled
        triggerProps={{ 'aria-label': 'Disabled currency' }}
        contentProps={{ 'aria-label': 'Disabled currencies' }}
      />
      <Button onClick={() => setPrimaryCurrency(null)}>
        Clear primary currency
      </Button>
      <Button onClick={() => setPrimaryCurrency('USD')}>
        Use USD for primary
      </Button>
      <Text role="status" aria-label="Saved currencies">
        Primary: {primaryCurrency ?? 'None'}; Secondary:{' '}
        {secondaryCurrency ?? 'None'}
      </Text>
      <Text role="status" aria-label="Primary currency changes">
        Changes: {primaryChanges}; Reason: {primaryReason}; Trigger:{' '}
        {primaryTriggerTarget}
      </Text>
    </TwentyUiGalleryCard>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'b613ee94-d9d9-477a-b76a-606637c81c11',
  name: 'twenty-ui-currency-picker',
  description: 'Shorthand and composed currency search in the sandbox',
  component: CurrencyPickerExample,
});
