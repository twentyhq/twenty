import { msg } from '@lingui/core/macro';
import { AllowedAddressSubField } from 'twenty-shared/src/types/AddressFieldsType';

export const DEFAULT_SELECTION_ADDRESS_WITH_MESSAGES: {
  value: AllowedAddressSubField;
  label: ReturnType<typeof msg>;
}[] = [
  {
    value: 'addressStreet1',
    label: msg`Address 1`,
  },
  {
    value: 'addressStreet2',
    label: msg`Address 2`,
  },
  {
    value: 'addressCity',
    label: msg`City`,
  },
  {
    value: 'addressState',
    label: msg`State`,
  },
  {
    value: 'addressPostcode',
    label: msg`Postcode`,
  },
  {
    value: 'addressCountry',
    label: msg`Country`,
  },
];
