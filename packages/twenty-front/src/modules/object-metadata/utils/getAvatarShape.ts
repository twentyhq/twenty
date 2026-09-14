import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { getImageIdentifierFieldMetadataItem } from '@/object-metadata/utils/getImageIdentifierFieldMetadataItem';
import { CoreObjectNameSingular, FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const getAvatarShape = (
  objectMetadataItem?: Pick<
    EnrichedObjectMetadataItem,
    'fields' | 'imageIdentifierFieldMetadataId' | 'nameSingular'
  >,
) => {
  if (!isDefined(objectMetadataItem)) {
    return 'circle';
  }

  if (
    objectMetadataItem.nameSingular === CoreObjectNameSingular.WorkspaceMember
  ) {
    return 'circle';
  }

  const imageIdentifierFieldMetadataItem =
    getImageIdentifierFieldMetadataItem(objectMetadataItem);

  if (isDefined(imageIdentifierFieldMetadataItem)) {
    switch (imageIdentifierFieldMetadataItem.type) {
      case FieldMetadataType.LINKS:
        return 'square';
      case FieldMetadataType.FILES:
        return 'circle';
    }
  }

  if (
    objectMetadataItem.nameSingular === CoreObjectNameSingular.Task ||
    objectMetadataItem.nameSingular === CoreObjectNameSingular.Note
  ) {
    return 'rounded-square';
  }

  return 'circle';
};
