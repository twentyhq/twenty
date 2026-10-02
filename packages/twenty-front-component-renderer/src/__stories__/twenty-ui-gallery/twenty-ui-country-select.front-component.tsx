import { useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { CountrySelect } from 'twenty-ui/components';

import { TwentyUiGalleryCard } from '@/__stories__/shared/front-components/twenty-ui-gallery-card';

const COUNTRIES = [
  { value: 'France', label: 'France', flag: '🇫🇷' },
  { value: 'Brazil', label: 'Brésil', flag: '🇧🇷' },
  { value: 'Japan', label: 'Japon', flag: '🇯🇵' },
];

const LABELS = {
  search: 'Search countries',
  noCountry: 'No country',
  noResults: 'No countries found',
};

const CountrySelectExample = () => {
  const [country, setCountry] = useState('France');
  const [shippingCountry, setShippingCountry] = useState('Japan');

  return (
    <TwentyUiGalleryCard title="Country selection">
      <CountrySelect
        countries={COUNTRIES}
        labels={LABELS}
        label="Billing country"
        value={country}
        onValueChange={setCountry}
      />
      <CountrySelect
        countries={COUNTRIES}
        labels={LABELS}
        label="Shipping country"
        value={shippingCountry}
        onValueChange={setShippingCountry}
      />
      <CountrySelect
        countries={COUNTRIES}
        labels={LABELS}
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
  description: 'Country labels, search, selection and clearing in the sandbox',
  component: CountrySelectExample,
});
