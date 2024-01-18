import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

export const getBasePathToShowPage = ({
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem;
}) => {
  const basePathToShowPage = `/object/${objectMetadataItem.nameSingular}/`;

  return basePathToShowPage;
};
