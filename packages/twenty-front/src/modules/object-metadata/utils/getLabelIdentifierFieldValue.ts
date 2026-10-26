import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { t } from '@lingui/core/macro';
import { isDefined, isFieldValueRestricted } from 'twenty-shared/utils';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const getLabelIdentifierFieldValue = (
  record: ObjectRecord,
  labelIdentifierFieldMetadataItem: FieldMetadataItem | undefined,
): string => {
  if (!isDefined(labelIdentifierFieldMetadataItem)) {
    return record.id;
  }

  const recordIdentifierValue = record[labelIdentifierFieldMetadataItem.name];
  if (labelIdentifierFieldMetadataItem.type === FieldMetadataType.FULL_NAME) {
    return `${recordIdentifierValue?.firstName ?? ''} ${recordIdentifierValue?.lastName ?? ''}`;
  }

  if (isFieldValueRestricted(recordIdentifierValue)) {
    return t`Not shared`;
  }

  return isDefined(recordIdentifierValue) ? `${recordIdentifierValue}` : '';
};
