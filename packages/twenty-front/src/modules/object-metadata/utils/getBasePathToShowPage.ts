import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

const isWorkspaceMember = (objectMetadataItem: ObjectMetadataItem) =>
  objectMetadataItem.nameSingular === 'workspaceMember';

export const getBasePathToShowPage = ({
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem;
}) => {
  if (isWorkspaceMember(objectMetadataItem)) {
    return '';
  }

  const basePathToShowPage = `/object/${objectMetadataItem.nameSingular}/`;

  return basePathToShowPage;
};
