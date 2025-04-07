import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

export const useObjectMetadataMapById = () => {
  const objectMetadataItems = useObjectMetadataItems();

  return objectMetadataItems.objectMetadataItems.reduce(
    (acc, item) => {
      acc[item.id] = item;
      return acc;
    },
    {} as Record<string, ObjectMetadataItem>,
  );
};
