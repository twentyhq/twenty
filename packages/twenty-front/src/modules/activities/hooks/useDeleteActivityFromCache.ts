import { useApolloClient } from '@apollo/client';

import { ActivityForEditor } from '@/activities/types/ActivityForEditor';
import { triggerDeleteRecordsOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerDeleteRecordsOptimisticEffect';
import { useObjectMetadataItemOnly } from '@/object-metadata/hooks/useObjectMetadataItemOnly';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';

// TODO: this should be useDeleteRecordFromCache
export const useDeleteActivityFromCache = () => {
  const apolloClient = useApolloClient();

  const { objectMetadataItem: objectMetadataItemActivity } =
    useObjectMetadataItemOnly({
      objectNameSingular: CoreObjectNameSingular.Activity,
    });

  const { objectMetadataItems } = useObjectMetadataItems();

  const deleteActivityFromCache = (activityToDelete: ActivityForEditor) => {
    triggerDeleteRecordsOptimisticEffect({
      cache: apolloClient.cache,
      objectMetadataItem: objectMetadataItemActivity,
      objectMetadataItems,
      recordsToDelete: [{ ...activityToDelete, __typename: 'Activity' }],
    });
  };

  return {
    deleteActivityFromCache,
  };
};
