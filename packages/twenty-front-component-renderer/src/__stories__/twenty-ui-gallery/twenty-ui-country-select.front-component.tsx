import { useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { CountrySelect } from 'twenty-ui/components';

import { TwentyUiGalleryCard } from '@/__stories__/shared/front-components/twenty-ui-gallery-card';

const COUNTRIES = [
  { value: 'France', label: 'France', flag: '🇫🇷' },
  { value: 'Brazil', label: 'Brésil', flag: '🇧🇷' },
  { value: 'Japan', label: 'Japon', flag: '🇯🇵' },
];

const CountrySelectExample = () => {
  const [country, setCountry] = useState('France');
  const [shippingCountry, setShippingCountry] = useState('Japan');

  return (
    <TwentyUiGalleryCard title="Country selection">
      <CountrySelect
        countries={COUNTRIES}
        label="Billing country"
        value={country}
        onValueChange={setCountry}
      />
      <CountrySelect
        countries={COUNTRIES}
        label="Shipping country"
        value={shippingCountry}
        onValueChange={setShippingCountry}
      />
      <CountrySelect
        countries={COUNTRIES}
        label="Disabled country"
        value="France"
        onValueChange={setCountry}
        disabled
      />
      <p role="status" aria-label="Saved countries">
        Billing: {country || 'empty'}; Shipping: {shippingCountry || 'empty'}
      </p>
    </TwentyUiGalleryCard>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'fa3c0858-7f45-48aa-8406-8dd4e2aa24c9',
  name: 'twenty-ui-country-select',
  description:
    'Country labels and flags rendered in the sandbox, with popup interaction unsupported',
  component: CountrySelectExample,
});
