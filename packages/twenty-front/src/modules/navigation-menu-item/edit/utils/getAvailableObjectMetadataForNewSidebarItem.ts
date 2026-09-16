import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';

type GetAvailableObjectMetadataForNewSidebarItemProps = {
  objectMetadataItems: EnrichedObjectMetadataItem[];
  activeNonSystemObjectMetadataItems: EnrichedObjectMetadataItem[];
  objectMetadataIdsWithIndexView: Set<string>;
  objectMetadataIdsWithDisplayableViews: Set<string>;
};

type GetAvailableObjectMetadataForNewSidebarItemResult = {
  availableObjectMetadataItems: EnrichedObjectMetadataItem[];
  availableSystemObjectMetadataItems: EnrichedObjectMetadataItem[];
  objectMetadataItemsWithViews: EnrichedObjectMetadataItem[];
  availableSystemObjectMetadataItemsForView: EnrichedObjectMetadataItem[];
};

export const getAvailableObjectMetadataForNewSidebarItem = ({
  objectMetadataItems,
  activeNonSystemObjectMetadataItems,
  objectMetadataIdsWithIndexView,
  objectMetadataIdsWithDisplayableViews,
}: GetAvailableObjectMetadataForNewSidebarItemProps): GetAvailableObjectMetadataForNewSidebarItemResult => {
  const availableObjectMetadataItems = activeNonSystemObjectMetadataItems
    .filter((item) => objectMetadataIdsWithIndexView.has(item.id))
    .sort((a, b) => a.labelPlural.localeCompare(b.labelPlural));

  const activeSystemObjectMetadataItems = objectMetadataItems
    .filter((item) => item.isActive && item.isSystem)
    .sort((a, b) => a.labelPlural.localeCompare(b.labelPlural));

  const availableSystemObjectMetadataItems =
    activeSystemObjectMetadataItems.filter((item) =>
      objectMetadataIdsWithIndexView.has(item.id),
    );

  const objectMetadataItemsWithViews = objectMetadataItems
    .filter(
      (item) =>
        item.isActive && objectMetadataIdsWithDisplayableViews.has(item.id),
    )
    .filter((item) => !item.isSystem)
    .sort((a, b) => a.labelPlural.localeCompare(b.labelPlural));

  const availableSystemObjectMetadataItemsForView =
    activeSystemObjectMetadataItems.filter((item) =>
      objectMetadataIdsWithDisplayableViews.has(item.id),
    );

  return {
    availableObjectMetadataItems,
    availableSystemObjectMetadataItems,
    objectMetadataItemsWithViews,
    availableSystemObjectMetadataItemsForView,
  };
};
