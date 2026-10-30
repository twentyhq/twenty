import {
  type FieldAddressDraftValue,
  type FieldLinksDraftValue,
} from '@/object-record/record-field/ui/types/FieldInputDraftValue';
import {
  type FieldEmailsValue,
  type FieldFullNameValue,
  type FieldPhonesValue,
  type FormFieldCurrencyValue,
} from '@/object-record/record-field/ui/types/FieldMetadata';

export type FormFieldInputSubFieldPlaceholders = Partial<
  Record<
    | keyof FieldAddressDraftValue
    | keyof FormFieldCurrencyValue
    | keyof FieldEmailsValue
    | keyof FieldFullNameValue
    | keyof FieldLinksDraftValue
    | keyof FieldPhonesValue,
    string
  >
>;
