import { CoreObjectNameSingular } from 'twenty-shared/types';

import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';

// The notification object reaches existing workspaces through the standard
// metadata sync; the inbox must degrade gracefully until it has landed.
export const useIsNotificationObjectAvailable = () => {
  const { activeObjectMetadataItems } = useFilteredObjectMetadataItems();

  return activeObjectMetadataItems.some(
    (objectMetadataItem) =>
      objectMetadataItem.nameSingular === CoreObjectNameSingular.Notification,
  );
};
