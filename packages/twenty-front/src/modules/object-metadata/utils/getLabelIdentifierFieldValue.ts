import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { isDefined } from '~/utils/isDefined';

export const getLabelIdentifierFieldValue = (
  record: ObjectRecord,
  labelIdentifierFieldMetadataItem: FieldMetadataItem | undefined,
  objectNameSingular: string,
): string => {
  if (
    objectNameSingular === CoreObjectNameSingular.WorkspaceMember ||
    labelIdentifierFieldMetadataItem?.type === FieldMetadataType.FullName
  ) {
    return `${record.name?.firstName ?? ''} ${record.name?.lastName ?? ''}`;
  }

  if (isDefined(labelIdentifierFieldMetadataItem?.name)) {
    return String(record[labelIdentifierFieldMetadataItem.name]);
  }

  return '';
};
