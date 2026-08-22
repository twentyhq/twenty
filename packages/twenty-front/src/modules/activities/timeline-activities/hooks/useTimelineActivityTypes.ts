import { useQuery } from '@apollo/client/react';
import { useMemo } from 'react';

import { type TimelineActivityType } from '@/activities/timeline-activities/types/TimelineActivityType';
import { type TimelineActivityTypeMaps } from '@/activities/timeline-activities/types/TimelineActivityTypeMaps';
import { isTimelineActivityAction } from 'twenty-shared/timeline';
import { FindManyTimelineActivityTypesDocument } from '~/generated-metadata/graphql';

export const useTimelineActivityTypes = () => {
  const { data } = useQuery(FindManyTimelineActivityTypesDocument);

  const timelineActivityTypeMaps = useMemo<TimelineActivityTypeMaps>(() => {
    const timelineActivityTypes: TimelineActivityType[] = (
      data?.timelineActivityTypes ?? []
    ).map(({ emit, ...timelineActivityType }) => ({
      ...timelineActivityType,
      action: isTimelineActivityAction(emit?.on) ? emit.on : null,
      icon: timelineActivityType.icon ?? null,
      objectUniversalIdentifier: emit?.objectUniversalIdentifier ?? null,
      frontComponentUniversalIdentifier:
        timelineActivityType.frontComponentUniversalIdentifier ?? null,
    }));

    return {
      byId: new Map(
        timelineActivityTypes.map((timelineActivityType) => [
          timelineActivityType.id,
          timelineActivityType,
        ]),
      ),
      byUniversalIdentifier: new Map(
        timelineActivityTypes.map((timelineActivityType) => [
          timelineActivityType.universalIdentifier,
          timelineActivityType,
        ]),
      ),
    };
  }, [data?.timelineActivityTypes]);

  return { timelineActivityTypeMaps };
};
