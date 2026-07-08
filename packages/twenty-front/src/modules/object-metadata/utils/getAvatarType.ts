import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { getImageIdentifierFieldMetadataItem } from '@/object-metadata/utils/getImageIdentifierFieldMetadataItem';
import { CoreObjectNameSingular, FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const getAvatarType = (
  objectMetadataItem?: Pick<
    EnrichedObjectMetadataItem,
    'fields' | 'imageIdentifierFieldMetadataId' | 'nameSingular'
  >,
) => {
  if (!isDefined(objectMetadataItem)) {
    return 'rounded';
  }

  if (
    objectMetadataItem.nameSingular === CoreObjectNameSingular.WorkspaceMember
  ) {
    return 'rounded';
  }

  const imageIdentifierFieldMetadataItem =
    getImageIdentifierFieldMetadataItem(objectMetadataItem);

  if (isDefined(imageIdentifierFieldMetadataItem)) {
    switch (imageIdentifierFieldMetadataItem.type) {
      case FieldMetadataType.LINKS:
        return 'squared';
      case FieldMetadataType.FILES:
        return 'rounded';
    }
  }

  if (
    objectMetadataItem.nameSingular === CoreObjectNameSingular.Task ||
    objectMetadataItem.nameSingular === CoreObjectNameSingular.Note
  ) {
    return 'icon';
  }

  return 'rounded';
};
