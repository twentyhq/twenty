import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

type GetFavoriteSecondaryLabelProps = {
  objectMetadataItems: Pick<
    ObjectMetadataItem,
    'nameSingular' | 'labelSingular'
  >[];
  favoriteObjectNameSingular: string;
};

export const getFavoriteSecondaryLabel = ({
  objectMetadataItems,
  favoriteObjectNameSingular,
}: GetFavoriteSecondaryLabelProps) => {
  if (favoriteObjectNameSingular === 'view') {
    return 'View';
  }

  return objectMetadataItems.find(
    (objectMetadataItem) =>
      objectMetadataItem.nameSingular === favoriteObjectNameSingular,
  )?.labelSingular;
};
