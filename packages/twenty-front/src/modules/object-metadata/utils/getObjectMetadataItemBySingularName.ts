import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

export const getObjectMetadataItemByNameSingular = ({
  objectMetadataItems,
  objectNameSingular,
}: {
  objectMetadataItems: ObjectMetadataItem[];
  objectNameSingular: string;
}) => {
  const foundObjectMetadataItem = objectMetadataItems.find(
    (objectMetadataItem) =>
      objectMetadataItem.nameSingular === objectNameSingular,
  );

  if (!foundObjectMetadataItem) {
    throw new Error(
      `Could not find object metadata item with singular name ${objectNameSingular}`,
    );
  }

  return foundObjectMetadataItem;
};
