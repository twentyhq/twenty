import { t } from '@lingui/core/macro';
import { AllowedAddressSubField } from 'twenty-shared/src/types/AddressFieldsType';
export const DefaultSelectionAddressWithMessages: {
  value: AllowedAddressSubField;
  label: string;
}[] = [
  {
    value: 'addressStreet1',
    label: t`Address 1`,
  },
  {
    value: 'addressStreet2',
    label: t`Address 2`,
  },
  {
    value: 'addressCity',
    label: t`City`,
  },
  {
    value: 'addressState',
    label: t`State`,
  },
  {
    value: 'addressPostcode',
    label: t`Postcode`,
  },
  {
    value: 'addressCountry',
    label: t`Country`,
  },
];
