import { getEnabledAddressSubFields } from '@/object-metadata/utils/getEnabledAddressSubFields';
import {
  ALLOWED_ADDRESS_SUBFIELDS,
  type AllowedAddressSubField,
  type FieldMetadataSettingsMapping,
  type FieldMetadataType,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

const DEFAULT_SUB_FIELD: AllowedAddressSubField = 'addressCity';

const isAllowedAddressSubField = (
  value: string | null | undefined,
): value is AllowedAddressSubField =>
  ALLOWED_ADDRESS_SUBFIELDS.includes(value as AllowedAddressSubField);

export const resolveAddressSortSubField = ({
  settings,
  compositeSubField,
}: {
  settings:
    | FieldMetadataSettingsMapping[FieldMetadataType.ADDRESS]
    | null
    | undefined;
  compositeSubField?: string | null;
}): AllowedAddressSubField => {
  const enabledSubFields = getEnabledAddressSubFields(settings);

  if (
    isDefined(compositeSubField) &&
    isAllowedAddressSubField(compositeSubField) &&
    enabledSubFields.includes(compositeSubField)
  ) {
    return compositeSubField;
  }

  if (enabledSubFields.includes(DEFAULT_SUB_FIELD)) {
    return DEFAULT_SUB_FIELD;
  }

  return enabledSubFields[0] ?? DEFAULT_SUB_FIELD;
};
