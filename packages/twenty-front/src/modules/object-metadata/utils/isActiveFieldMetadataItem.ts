import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';

type IsFieldMetadataAvailableForViewFieldArgs = {
  objectNameSingular: string;
  fieldMetadata: Pick<FieldMetadataItem, 'name' | 'isSystem' | 'isActive'>;
};

export const isActiveFieldMetadataItem = ({
  objectNameSingular,
  fieldMetadata,
}: IsFieldMetadataAvailableForViewFieldArgs) => {
  if (fieldMetadata.isActive === false) {
    return false;
  }

  if (
    (objectNameSingular === CoreObjectNameSingular.Note &&
      fieldMetadata.name === 'noteTargets') ||
    (objectNameSingular === CoreObjectNameSingular.Task &&
      fieldMetadata.name === 'taskTargets')
  ) {
    return true;
  }

  if (fieldMetadata.isSystem === true) {
    return false;
  }

  return true;
};
