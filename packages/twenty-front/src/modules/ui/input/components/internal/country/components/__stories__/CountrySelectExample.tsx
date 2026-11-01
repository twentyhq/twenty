import { type ComponentProps, useState } from 'react';
import { Button } from 'twenty-ui/primitives/input';

import { CountrySelect } from '@/ui/input/components/internal/country/components/CountrySelect';

type CountrySelectExampleProps = ComponentProps<typeof CountrySelect>;

export const CountrySelectExample = ({
  label,
  selectedCountryName,
  onChange,
}: CountrySelectExampleProps) => {
  const [countryName, setCountryName] = useState(selectedCountryName);
  const [showCountrySelect, setShowCountrySelect] = useState(true);

  return (
    <>
      {showCountrySelect && (
        <CountrySelect
          label={label}
          selectedCountryName={countryName}
          onChange={(nextCountryName) => {
            setCountryName(nextCountryName);
            onChange(nextCountryName);
          }}
        />
      )}
      <output aria-label="Stored country">{countryName || 'empty'}</output>
      <Button onClick={() => setCountryName('Brazil')}>Set Brazil</Button>
      <Button onClick={() => setCountryName('FR')}>Set legacy country</Button>
      <Button onClick={() => setCountryName('')}>Set empty country</Button>
      <Button onClick={() => setShowCountrySelect(false)}>
        Unmount country picker
      </Button>
    </>
  );
};
