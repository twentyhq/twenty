import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

type GetObjectNavigationMenuItemSecondaryLabelProps = {
  objectMetadataItems: Pick<
    ObjectMetadataItem,
    'nameSingular' | 'labelSingular'
  >[];
  navigationMenuItemObjectNameSingular: string;
};

export const getObjectNavigationMenuItemSecondaryLabel = ({
  objectMetadataItems,
  navigationMenuItemObjectNameSingular,
}: GetObjectNavigationMenuItemSecondaryLabelProps) => {
  if (navigationMenuItemObjectNameSingular === 'view') {
    return 'View';
  }

  return objectMetadataItems.find(
    (objectMetadataItem) =>
      objectMetadataItem.nameSingular === navigationMenuItemObjectNameSingular,
  )?.labelSingular;
};
