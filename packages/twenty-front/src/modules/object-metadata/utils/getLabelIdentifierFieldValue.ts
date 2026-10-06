import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { t } from '@lingui/core/macro';
import { FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';
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

  // The server masks a calendar event's title with this sentinel when its
  // channel only shares metadata, and every chip, card and panel header that
  // names the record reads it from here.
  if (
    recordIdentifierValue === FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED
  ) {
    return t`Not shared`;
  }

  return isDefined(recordIdentifierValue) ? `${recordIdentifierValue}` : '';
};
