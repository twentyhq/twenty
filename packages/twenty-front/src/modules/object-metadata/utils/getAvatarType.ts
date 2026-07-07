import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { CoreObjectNameSingular, FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const getAvatarType = (
  objectNameSingular: string,
  imageIdentifierFieldMetadataItem?: FieldMetadataItem,
) => {
  if (isDefined(imageIdentifierFieldMetadataItem)) {
    switch (imageIdentifierFieldMetadataItem.type) {
      case FieldMetadataType.LINKS:
        return 'squared';
      case FieldMetadataType.FILES:
        return 'rounded';
    }
  }

  if (objectNameSingular === CoreObjectNameSingular.WorkspaceMember) {
    return 'rounded';
  }

  if (objectNameSingular === CoreObjectNameSingular.Company) {
    return 'squared';
  }

  if (
    objectNameSingular === CoreObjectNameSingular.Task ||
    objectNameSingular === CoreObjectNameSingular.Note
  ) {
    return 'icon';
  }

  return 'rounded';
};
