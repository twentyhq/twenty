import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { isDefined } from 'twenty-shared/utils';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const getLabelIdentifierFieldValue = (
  record: ObjectRecord,
  labelIdentifierFieldMetadataItem: FieldMetadataItem | undefined,
  objectNameSingular: string,
): string => {
  if (!isDefined(labelIdentifierFieldMetadataItem)) {
    return record.id;
  }

  const recordIdentifierValue = record[labelIdentifierFieldMetadataItem.name];
  if (
    objectNameSingular === CoreObjectNameSingular.WorkspaceMember ||
    labelIdentifierFieldMetadataItem.type === FieldMetadataType.FULL_NAME
  ) {
    return `${recordIdentifierValue?.firstName ?? ''} ${recordIdentifierValue?.lastName ?? ''}`;
  }

  return isDefined(recordIdentifierValue) ? `${recordIdentifierValue}` : '';
};
