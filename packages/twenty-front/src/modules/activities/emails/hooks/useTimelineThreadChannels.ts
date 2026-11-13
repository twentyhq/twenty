import { useQuery } from '@apollo/client/react';

import { type ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { getTimelineThreadChannelsFromObjectRecord } from '@/activities/emails/graphql/queries/getTimelineThreadChannelsFromObjectRecord';
import {
  type GetTimelineThreadChannelsFromObjectRecordQuery,
  type GetTimelineThreadChannelsFromObjectRecordQueryVariables,
} from '~/generated/graphql';

export const useTimelineThreadChannels = (
  targetRecord: ActivityTargetableObject,
) => {
  const apolloCoreClient = useApolloCoreClient();

  const { data, loading } = useQuery<
    GetTimelineThreadChannelsFromObjectRecordQuery,
    GetTimelineThreadChannelsFromObjectRecordQueryVariables
  >(getTimelineThreadChannelsFromObjectRecord, {
    client: apolloCoreClient,
    variables: {
      objectNameSingular: targetRecord.targetObjectNameSingular,
      recordId: targetRecord.id,
    },
  });

  return {
    timelineThreadChannels:
      data?.getTimelineThreadChannelsFromObjectRecord ?? [],
    loading,
  };
};
