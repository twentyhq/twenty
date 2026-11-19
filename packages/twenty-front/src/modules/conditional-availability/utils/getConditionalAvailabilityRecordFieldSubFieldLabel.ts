import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getCompositeSubFieldLabel } from '@/object-record/object-filter-dropdown/utils/getCompositeSubFieldLabel';
import { isCompositeFieldType } from '@/object-record/object-filter-dropdown/utils/isCompositeFieldType';
import { isValidSubFieldName } from '@/settings/data-model/utils/isValidSubFieldName';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

export const getConditionalAvailabilityRecordFieldSubFieldLabel = ({
  field,
  subFieldName,
}: {
  field: Pick<FieldMetadataItem, 'type'>;
  subFieldName: string | null;
}): string | null => {
  if (
    !isDefined(subFieldName) ||
    !isCompositeFieldType(field.type) ||
    !isValidSubFieldName(subFieldName)
  ) {
    return null;
  }

  const subFieldLabel = getCompositeSubFieldLabel(field.type, subFieldName);

  return isNonEmptyString(subFieldLabel) ? subFieldLabel : null;
};
