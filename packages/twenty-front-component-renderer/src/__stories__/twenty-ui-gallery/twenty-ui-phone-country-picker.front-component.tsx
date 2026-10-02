import { useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import {
  Dropdown,
  PhoneCountryPicker,
  type PhoneCountryOption,
} from 'twenty-ui/components';
import { Text } from 'twenty-ui/primitives/typography';

import { TwentyUiGalleryCard } from '@/__stories__/shared/front-components/twenty-ui-gallery-card';

const COUNTRIES: PhoneCountryOption[] = [
  { value: 'FR', label: 'France', callingCode: '33', flag: '🇫🇷' },
  { value: 'GB', label: 'United Kingdom', callingCode: '44', flag: '🇬🇧' },
  { value: 'US', label: 'United States', callingCode: '1', flag: '🇺🇸' },
];

const PhoneCountrySelector = ({
  label,
  initialValue,
  disabled = false,
}: {
  label: string;
  initialValue?: string;
  disabled?: boolean;
}) => {
  const [value, setValue] = useState(initialValue);
  const [changeCount, setChangeCount] = useState(0);

  return (
    <>
      <Dropdown.Root type="picker">
        <PhoneCountryPicker.Trigger
          aria-label={label}
          country={COUNTRIES.find((country) => country.value === value)}
          disabled={disabled}
        />
        <Dropdown.Content aria-label={`Choose ${label}`} width={280}>
          <PhoneCountryPicker.Options
            countries={COUNTRIES}
            value={value}
            onValueChange={(nextValue) => {
              setValue(nextValue);
              setChangeCount((count) => count + 1);
            }}
            searchLabel={`Search ${label}`}
            emptyLabel="No countries found"
          />
        </Dropdown.Content>
      </Dropdown.Root>
      <Text role="status" aria-label={`${label} selection`}>
        Country: {value ?? 'none'}; Changes: {changeCount}
      </Text>
    </>
  );
};

const PhoneCountryPickerExample = () => (
  <TwentyUiGalleryCard title="PhoneCountryPicker">
    <PhoneCountrySelector label="Primary phone country" initialValue="US" />
    <PhoneCountrySelector label="Secondary phone country" initialValue="FR" />
    <PhoneCountrySelector label="Disabled phone country" disabled />
  </TwentyUiGalleryCard>
);

export default defineFrontComponent({
  universalIdentifier: 'e87226d5-27b6-4876-979b-b9567e0b94f9',
  name: 'twenty-ui-phone-country-picker',
  description:
    'Country search, calling-code selection, and independent phone selectors',
  component: PhoneCountryPickerExample,
});
