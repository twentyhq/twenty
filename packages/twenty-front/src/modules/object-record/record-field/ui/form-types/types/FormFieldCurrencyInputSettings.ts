import { type FieldMetadataType } from 'twenty-shared/types';

export type FormFieldCurrencyInputSettings = {
  type: FieldMetadataType.CURRENCY;
  amountUnit: 'micros' | 'units';
};
