import { getTimelineCalendarEventsFromObjectRecord } from '@/activities/calendar/graphql/queries/getTimelineCalendarEventsFromObjectRecord';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useCallback } from 'react';

export const useRefetchTimelineCalendarEvents = () => {
  const apolloCoreClient = useApolloCoreClient();

  const refetchTimelineCalendarEvents = useCallback(
    () =>
      apolloCoreClient.refetchQueries({
        include: [getTimelineCalendarEventsFromObjectRecord],
      }),
    [apolloCoreClient],
  );

  return { refetchTimelineCalendarEvents };
};
