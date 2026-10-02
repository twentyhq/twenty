import { useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { CurrencyPicker, Dropdown } from 'twenty-ui/components';
import { Text } from 'twenty-ui/primitives/typography';

import { TwentyUiGalleryCard } from '@/__stories__/shared/front-components/twenty-ui-gallery-card';

const CURRENCIES = [
  { code: 'CAD', name: 'Canadian Dollar' },
  { code: 'EUR', name: 'Euro' },
  { code: 'JPY', name: 'Japanese Yen', disabled: true },
  { code: 'USD', name: 'US Dollar' },
];

const CurrencyPickerExample = () => {
  const [primaryCurrency, setPrimaryCurrency] = useState('EUR');
  const [secondaryCurrency, setSecondaryCurrency] = useState('USD');
  const [primaryOpen, setPrimaryOpen] = useState(false);
  const [secondaryOpen, setSecondaryOpen] = useState(false);

  return (
    <TwentyUiGalleryCard title="Currency picker">
      <Dropdown.Root
        type="picker"
        open={primaryOpen}
        onOpenChange={setPrimaryOpen}
      >
        <CurrencyPicker.Trigger
          aria-label="Primary currency"
          value={primaryCurrency}
        />
        <Dropdown.Content aria-label="Primary currencies">
          <CurrencyPicker.Options
            currencies={CURRENCIES}
            value={primaryCurrency}
            searchLabel="Search primary currencies"
            emptyLabel="No matching currencies"
            onValueChange={(code) => {
              setPrimaryCurrency(code);
              setPrimaryOpen(false);
            }}
          />
        </Dropdown.Content>
      </Dropdown.Root>
      <Dropdown.Root
        type="picker"
        open={secondaryOpen}
        onOpenChange={setSecondaryOpen}
      >
        <CurrencyPicker.Trigger
          aria-label="Secondary currency"
          value={secondaryCurrency}
        />
        <Dropdown.Content aria-label="Secondary currencies">
          <CurrencyPicker.Options
            currencies={CURRENCIES}
            value={secondaryCurrency}
            searchLabel="Search secondary currencies"
            onValueChange={(code) => {
              setSecondaryCurrency(code);
              setSecondaryOpen(false);
            }}
          />
        </Dropdown.Content>
      </Dropdown.Root>
      <Dropdown.Root type="picker">
        <CurrencyPicker.Trigger
          aria-label="Disabled currency"
          value="EUR"
          disabled
        />
        <Dropdown.Content aria-label="Disabled currencies">
          <CurrencyPicker.Options
            currencies={CURRENCIES}
            value="EUR"
            disabled
            onValueChange={() => undefined}
          />
        </Dropdown.Content>
      </Dropdown.Root>
      <Text role="status">
        Primary: {primaryCurrency}; Secondary: {secondaryCurrency}
      </Text>
    </TwentyUiGalleryCard>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'b613ee94-d9d9-477a-b76a-606637c81c11',
  name: 'twenty-ui-currency-picker',
  description: 'Currency search and independent selections in the sandbox',
  component: CurrencyPickerExample,
});
