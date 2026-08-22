import { useQuery } from '@apollo/client/react';
import { useMemo } from 'react';

import { type TimelineActivityType } from '@/activities/timeline-activities/types/TimelineActivityType';
import { isTimelineActivityAction } from 'twenty-shared/timeline';
import { FindManyTimelineActivityTypesDocument } from '~/generated-metadata/graphql';

export const useTimelineActivityTypes = () => {
  const { data } = useQuery(FindManyTimelineActivityTypesDocument);

  const timelineActivityTypeById = useMemo(
    () =>
      new Map<string, TimelineActivityType>(
        (data?.timelineActivityTypes ?? []).map((timelineActivityType) => [
          timelineActivityType.id,
          {
            ...timelineActivityType,
            action: isTimelineActivityAction(timelineActivityType.action)
              ? timelineActivityType.action
              : null,
            icon: timelineActivityType.icon ?? null,
            objectUniversalIdentifier:
              timelineActivityType.objectUniversalIdentifier ?? null,
            frontComponentUniversalIdentifier:
              timelineActivityType.frontComponentUniversalIdentifier ?? null,
          },
        ]),
      ),
    [data?.timelineActivityTypes],
  );

  return { timelineActivityTypeById };
};
