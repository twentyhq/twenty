import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

type GetNavigationMenuItemSecondaryLabelProps = {
  objectMetadataItems: Pick<
    ObjectMetadataItem,
    'nameSingular' | 'labelSingular'
  >[];
  navigationMenuItemObjectNameSingular: string;
};

export const getNavigationMenuItemSecondaryLabel = ({
  objectMetadataItems,
  navigationMenuItemObjectNameSingular,
}: GetNavigationMenuItemSecondaryLabelProps) => {
  if (navigationMenuItemObjectNameSingular === 'view') {
    return 'View';
  }

  return objectMetadataItems.find(
    (objectMetadataItem) =>
      objectMetadataItem.nameSingular === navigationMenuItemObjectNameSingular,
  )?.labelSingular;
};
