import { useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { isDefined } from 'twenty-shared/utils';
import { CountrySelect } from 'twenty-ui/components/input';
import { Dropdown } from 'twenty-ui/components/navigation';
import { Button } from 'twenty-ui/primitives/input';

import { TwentyUiGalleryCard } from '@/__stories__/shared/front-components/twenty-ui-gallery-card';

const COUNTRIES = [
  { value: 'FR', label: 'France', flag: '🇫🇷' },
  { value: 'BR', label: 'Brésil', flag: '🇧🇷' },
  { value: 'JP', label: 'Japon', flag: '🇯🇵' },
  { value: 'US', label: 'Unavailable country', flag: '🇺🇸', disabled: true },
];

const CountrySelectExample = () => {
  const [country, setCountry] = useState<string | null>('FR');
  const [shippingCountry, setShippingCountry] = useState<string | null>('JP');
  const [defaultCountry, setDefaultCountry] = useState<string | null>('FR');
  const [cancelableCountry, setCancelableCountry] = useState<string | null>(
    'FR',
  );
  const [changeDetails, setChangeDetails] = useState('none');
  const [canceledChangeDetails, setCanceledChangeDetails] = useState('none');
  const [triggerClickCount, setTriggerClickCount] = useState(0);

  return (
    <TwentyUiGalleryCard title="Country selection">
      <CountrySelect
        countries={COUNTRIES}
        label="Billing country"
        value={country}
        onValueChange={(value, eventDetails) => {
          setCountry(value);
          setChangeDetails(
            `${value ?? 'null'}:${eventDetails.reason}:${eventDetails.event.type}:${eventDetails.trigger?.textContent?.trim()}`,
          );
        }}
        title="Choose a billing country"
        ref={(element) => {
          if (isDefined(element)) {
            element.setAttribute('data-ref-target', 'billing-country');
          }
        }}
        render={<button data-render-target="billing-country" />}
        onClick={() => setTriggerClickCount((count) => count + 1)}
        popupProps={{ 'aria-label': 'Billing countries' }}
        optionsProps={{
          'aria-label': 'Billing country choices',
          render: <section data-render-target="billing-country-choices" />,
          ref: (element) => {
            if (isDefined(element)) {
              element.setAttribute(
                'data-ref-target',
                'billing-country-choices',
              );
            }
          },
        }}
        searchProps={{
          title: 'Search billing countries',
          ref: (element) => {
            if (isDefined(element)) {
              element.setAttribute('data-ref-target', 'billing-country-search');
            }
          },
        }}
      />
      <CountrySelect.Root
        countries={COUNTRIES}
        value={shippingCountry}
        onValueChange={setShippingCountry}
      >
        <Dropdown.Root type="picker">
          <CountrySelect.Trigger label="Shipping country" />
          <Dropdown.Content aria-label="Shipping countries">
            <CountrySelect.Options />
          </Dropdown.Content>
        </Dropdown.Root>
      </CountrySelect.Root>
      <CountrySelect
        countries={COUNTRIES}
        label="Default country"
        defaultValue="FR"
        onValueChange={setDefaultCountry}
      />
      <CountrySelect.Root
        countries={COUNTRIES}
        defaultValue="FR"
        onValueChange={(value, eventDetails) => {
          if (value === 'BR') {
            eventDetails.cancel();
            setCanceledChangeDetails(
              `${value}:${eventDetails.reason}:${eventDetails.isCanceled}`,
            );

            return;
          }

          setCancelableCountry(value);
        }}
      >
        <Dropdown.Root type="picker">
          <CountrySelect.Trigger label="Cancelable country" />
          <Dropdown.Content aria-label="Cancelable countries">
            <CountrySelect.Options />
          </Dropdown.Content>
        </Dropdown.Root>
      </CountrySelect.Root>
      <CountrySelect
        countries={COUNTRIES}
        label="Disabled country"
        value="FR"
        onValueChange={setCountry}
        disabled
      />
      <Button
        onClick={() => {
          setCountry('BR');
          setShippingCountry('BR');
        }}
      >
        Set countries externally
      </Button>
      <Button
        onClick={() => {
          setCountry(null);
          setShippingCountry(null);
        }}
      >
        Clear countries externally
      </Button>
      <p role="status" aria-label="Saved countries">
        Billing: {country ?? 'null'}; Shipping: {shippingCountry ?? 'null'};
        Default: {defaultCountry ?? 'null'}; Cancelable:{' '}
        {cancelableCountry ?? 'null'}
      </p>
      <p role="status" aria-label="Country change details">
        {changeDetails}
      </p>
      <p role="status" aria-label="Canceled country change">
        {canceledChangeDetails}
      </p>
      <p role="status" aria-label="Country trigger click count">
        {triggerClickCount}
      </p>
    </TwentyUiGalleryCard>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'fa3c0858-7f45-48aa-8406-8dd4e2aa24c9',
  name: 'twenty-ui-country-select',
  description:
    'Stable country IDs, translated labels, nullable selection and compound picker composition',
  component: CountrySelectExample,
});
