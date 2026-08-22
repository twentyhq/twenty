import { useQuery } from '@apollo/client/react';
import { useMemo } from 'react';

import { type TimelineActivityType } from '@/activities/timeline-activities/types/TimelineActivityType';
import {
  isTimelineActivityAction,
  isTimelineActivityRenderer,
} from 'twenty-shared/timeline';
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
            renderer: isTimelineActivityRenderer(timelineActivityType.renderer)
              ? timelineActivityType.renderer
              : null,
            objectUniversalIdentifier:
              timelineActivityType.objectUniversalIdentifier ?? null,
          },
        ]),
      ),
    [data?.timelineActivityTypes],
  );

  return { timelineActivityTypeById };
};
