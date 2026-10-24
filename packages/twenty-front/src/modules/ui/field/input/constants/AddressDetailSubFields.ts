import { type AllowedAddressSubField } from 'twenty-shared/types';

export const ADDRESS_DETAIL_SUB_FIELDS = [
  'addressStreet2',
  'addressCity',
  'addressState',
  'addressPostcode',
  'addressCountry',
] as const satisfies readonly AllowedAddressSubField[];
