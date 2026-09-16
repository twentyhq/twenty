import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';

type GetObjectNavigationMenuItemSecondaryLabelProps = {
  objectMetadataItems: Pick<
    EnrichedObjectMetadataItem,
    'nameSingular' | 'labelSingular' | 'labelPlural'
  >[];
  navigationMenuItemObjectNameSingular: string;
  isView?: boolean;
};

export const getObjectNavigationMenuItemSecondaryLabel = ({
  objectMetadataItems,
  navigationMenuItemObjectNameSingular,
  isView = false,
}: GetObjectNavigationMenuItemSecondaryLabelProps) => {
  if (navigationMenuItemObjectNameSingular === 'view') {
    return 'View';
  }

  const objectMetadataItem = objectMetadataItems.find(
    (objectMetadataItem) =>
      objectMetadataItem.nameSingular === navigationMenuItemObjectNameSingular,
  );

  return isView
    ? objectMetadataItem?.labelPlural
    : objectMetadataItem?.labelSingular;
};
