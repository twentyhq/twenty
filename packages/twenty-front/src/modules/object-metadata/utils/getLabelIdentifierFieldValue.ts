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

  if (
    objectNameSingular === CoreObjectNameSingular.WorkspaceMember ||
    labelIdentifierFieldMetadataItem.type === FieldMetadataType.FULL_NAME
  ) {
    return `${record[labelIdentifierFieldMetadataItem.name]?.firstName ?? ''} ${record[labelIdentifierFieldMetadataItem.name]?.lastName ?? ''}`;
  }

  return record[labelIdentifierFieldMetadataItem.name] ?? '';
};
