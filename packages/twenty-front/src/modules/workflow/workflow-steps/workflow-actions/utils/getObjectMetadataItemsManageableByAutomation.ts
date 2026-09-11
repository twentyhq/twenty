import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { canObjectBeManagedByAutomation } from 'twenty-shared/workflow';

// System objects are writable by automations unless they are explicitly
// blocked, so the only gate here is the block list. They are listed after the
// regular objects, like in the Search Records and Database Event dropdowns.
export const getObjectMetadataItemsManageableByAutomation = (
  objectMetadataItems: EnrichedObjectMetadataItem[],
): EnrichedObjectMetadataItem[] => {
  const manageableObjectMetadataItems = objectMetadataItems.filter(
    (objectMetadataItem) =>
      objectMetadataItem.isActive === true &&
      canObjectBeManagedByAutomation({
        nameSingular: objectMetadataItem.nameSingular,
      }),
  );

  return [
    ...manageableObjectMetadataItems.filter(
      (objectMetadataItem) => objectMetadataItem.isSystem !== true,
    ),
    ...manageableObjectMetadataItems.filter(
      (objectMetadataItem) => objectMetadataItem.isSystem === true,
    ),
  ];
};
