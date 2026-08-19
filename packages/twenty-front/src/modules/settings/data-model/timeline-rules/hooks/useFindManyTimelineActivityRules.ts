import { useQuery } from '@apollo/client/react';
import {
  FindManyTimelineActivityRulesDocument,
  type FindManyTimelineActivityRulesQuery,
} from '~/generated-metadata/graphql';

export type TimelineActivityRule =
  FindManyTimelineActivityRulesQuery['timelineActivityRules'][number];

export const useFindManyTimelineActivityRules = () => {
  const { data, loading } = useQuery(FindManyTimelineActivityRulesDocument);

  return {
    timelineActivityRules: data?.timelineActivityRules ?? [],
    loading,
  };
};
