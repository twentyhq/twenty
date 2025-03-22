import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { isDefined } from 'twenty-shared/utils';

export const getLabelIdentifierFieldValue = (
  record: ObjectRecord,
  labelIdentifierFieldMetadataItem: FieldMetadataItem | undefined,
  objectNameSingular: string,
): string => {
  if (
    objectNameSingular === CoreObjectNameSingular.WorkspaceMember ||
    labelIdentifierFieldMetadataItem?.type === FieldMetadataType.FULL_NAME
  ) {
    return `${record.name?.firstName ?? ''} ${record.name?.lastName ?? ''}`;
  }

  if (isDefined(labelIdentifierFieldMetadataItem?.name)) {
    return record[labelIdentifierFieldMetadataItem.name];
  }

  return '';
};
