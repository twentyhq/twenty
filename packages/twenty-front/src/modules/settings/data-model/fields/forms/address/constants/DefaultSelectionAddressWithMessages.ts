import { msg } from '@lingui/core/macro';
import { DEFAULT_VISIBLE_ADDRESS_SUBFIELDS } from 'twenty-shared/constants';
import { type AllowedAddressSubField } from 'twenty-shared/types';

export const DEFAULT_SELECTION_ADDRESS_WITH_MESSAGES: {
  value: AllowedAddressSubField;
  label: ReturnType<typeof msg>;
}[] = DEFAULT_VISIBLE_ADDRESS_SUBFIELDS.map((value) => ({
  value,
  label: {
    addressStreet1: msg`Address 1`,
    addressStreet2: msg`Address 2`,
    addressCity: msg`City`,
    addressState: msg`State`,
    addressPostcode: msg`Postcode`,
    addressCountry: msg`Country`,
  }[value],
}));
