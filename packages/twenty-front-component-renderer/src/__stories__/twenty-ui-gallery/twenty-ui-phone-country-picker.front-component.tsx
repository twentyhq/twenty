import { useRef, useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import {
  PhoneCountryPicker,
  type PhoneCountryOption,
} from 'twenty-ui/components/input';
import { Dropdown } from 'twenty-ui/components/navigation';
import { Button } from 'twenty-ui/primitives/input';
import { Text } from 'twenty-ui/primitives/typography';

import { TwentyUiGalleryCard } from '@/__stories__/shared/front-components/twenty-ui-gallery-card';

const COUNTRIES: PhoneCountryOption[] = [
  { value: 'FR', label: 'France', callingCode: '33', flag: '🇫🇷' },
  { value: 'GB', label: 'United Kingdom', callingCode: '44', flag: '🇬🇧' },
  { value: 'US', label: 'United States', callingCode: '1', flag: '🇺🇸' },
  { value: 'RE', label: 'Réunion', callingCode: '262', flag: '🇷🇪' },
  {
    value: 'SA',
    label: 'المملكة العربية السعودية',
    callingCode: '966',
    flag: '🇸🇦',
  },
  {
    value: 'JP',
    label: 'Japan',
    callingCode: '81',
    flag: '🇯🇵',
    disabled: true,
  },
];

const PhoneCountryPickerExample = () => {
  const [primaryCountry, setPrimaryCountry] = useState<string | null>('US');
  const [secondaryCountry, setSecondaryCountry] = useState<string | null>('FR');
  const [primaryChanges, setPrimaryChanges] = useState(0);
  const [secondaryChanges, setSecondaryChanges] = useState(0);
  const [primaryEvent, setPrimaryEvent] = useState('none');
  const [secondaryEvent, setSecondaryEvent] = useState('none');
  const [referenceTargets, setReferenceTargets] = useState('unread');
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);

  return (
    <TwentyUiGalleryCard title="PhoneCountryPicker">
      <PhoneCountryPicker
        ref={triggerRef}
        aria-label="Primary phone country"
        data-phone-trigger="primary"
        countries={COUNTRIES}
        value={primaryCountry}
        onValueChange={(value, eventDetails) => {
          setPrimaryCountry(value);
          setPrimaryChanges((count) => count + 1);
          setPrimaryEvent(`${eventDetails.reason}/${eventDetails.event.type}`);
          setReferenceTargets(
            `${triggerRef.current?.getAttribute('data-phone-trigger') ?? 'missing'}/${optionsRef.current?.getAttribute('data-phone-options') ?? 'missing'}`,
          );
        }}
        render={<Button variant="ghost" />}
        contentProps={{
          'aria-label': 'Choose primary phone country',
          width: 280,
        }}
        optionsProps={{
          ref: optionsRef,
          dir: 'rtl',
          render: <section data-phone-options="primary" />,
          searchLabel: 'Search primary phone country',
          listLabel: 'Primary phone countries',
          emptyLabel: 'No countries found',
        }}
      />
      <PhoneCountryPicker.Root
        countries={COUNTRIES}
        defaultValue="FR"
        onValueChange={(value, eventDetails) => {
          if (value === 'GB') {
            eventDetails.cancel();
            setSecondaryEvent(`canceled/${eventDetails.reason}`);
            return;
          }

          setSecondaryCountry(value);
          setSecondaryChanges((count) => count + 1);
          setSecondaryEvent(
            `${eventDetails.reason}/${eventDetails.event.type}`,
          );
        }}
      >
        <Dropdown.Root type="picker">
          <PhoneCountryPicker.Trigger aria-label="Secondary phone country" />
          <Dropdown.Content
            aria-label="Choose secondary phone country"
            width={280}
          >
            <PhoneCountryPicker.Options
              searchLabel="Search secondary phone country"
              listLabel="Secondary phone countries"
              emptyLabel="No countries found"
            />
          </Dropdown.Content>
        </Dropdown.Root>
      </PhoneCountryPicker.Root>
      <PhoneCountryPicker
        aria-label="Disabled phone country"
        countries={COUNTRIES}
        disabled
      />
      <Button onClick={() => setPrimaryCountry(null)}>
        Clear primary country
      </Button>
      <Button onClick={() => setPrimaryCountry('FR')}>
        Set primary country to France
      </Button>
      <Text role="status" aria-label="Primary phone country selection">
        Country: {primaryCountry ?? 'none'}; Changes: {primaryChanges}; Event:{' '}
        {primaryEvent}; Refs: {referenceTargets}
      </Text>
      <Text role="status" aria-label="Secondary phone country selection">
        Country: {secondaryCountry ?? 'none'}; Changes: {secondaryChanges};
        Event: {secondaryEvent}
      </Text>
      <Text role="status" aria-label="Disabled phone country selection">
        Country: none
      </Text>
    </TwentyUiGalleryCard>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'e87226d5-27b6-4876-979b-b9567e0b94f9',
  name: 'twenty-ui-phone-country-picker',
  description:
    'Complete and compound phone country pickers sharing search and selection',
  component: PhoneCountryPickerExample,
});
