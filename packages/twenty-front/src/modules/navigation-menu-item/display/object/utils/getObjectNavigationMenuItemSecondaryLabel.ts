import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';

type GetObjectNavigationMenuItemSecondaryLabelProps = {
  objectMetadataItems: Pick<
    EnrichedObjectMetadataItem,
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
