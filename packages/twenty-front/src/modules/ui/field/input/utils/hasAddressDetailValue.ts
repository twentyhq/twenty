import { type FieldAddressDraftValue } from '@/object-record/record-field/ui/types/FieldInputDraftValue';
import { ADDRESS_DETAIL_SUB_FIELDS } from '@/ui/field/input/constants/AddressDetailSubFields';
import { isNonEmptyString } from '@sniptt/guards';

export const hasAddressDetailValue = (
  address: Pick<
    FieldAddressDraftValue,
    (typeof ADDRESS_DETAIL_SUB_FIELDS)[number]
  >,
) =>
  ADDRESS_DETAIL_SUB_FIELDS.some((subField) =>
    isNonEmptyString(address[subField]),
  );
