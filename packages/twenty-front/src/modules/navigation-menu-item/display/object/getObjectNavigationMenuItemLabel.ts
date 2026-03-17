import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const getObjectNavigationMenuItemLabel = (
  item: Pick<NavigationMenuItem, 'targetObjectMetadataId'>,
  objectMetadataItems: Pick<ObjectMetadataItem, 'id' | 'labelPlural'>[],
): string => {
  const objectMetadataItem = objectMetadataItems.find(
    (meta) => meta.id === item.targetObjectMetadataId,
  );
  return objectMetadataItem?.labelPlural ?? '';
};
