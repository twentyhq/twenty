import { type FieldAddressDraftValue } from '@/object-record/record-field/ui/types/FieldInputDraftValue';
import { ADDRESS_DETAIL_SUB_FIELDS } from '@/ui/field/input/constants/AddressDetailSubFields';
import { isNonEmptyString } from '@sniptt/guards';
import { type AllowedAddressSubField } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const hasAddressDetailValue = ({
  address,
  subFields,
}: {
  address: Pick<
    FieldAddressDraftValue,
    (typeof ADDRESS_DETAIL_SUB_FIELDS)[number]
  >;
  subFields?: AllowedAddressSubField[] | null;
}) =>
  ADDRESS_DETAIL_SUB_FIELDS.some(
    (subField) =>
      (!isDefined(subFields) || subFields.includes(subField)) &&
      isNonEmptyString(address[subField]),
  );
