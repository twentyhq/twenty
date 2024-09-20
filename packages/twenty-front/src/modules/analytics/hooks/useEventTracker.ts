import { useCallback } from 'react';
import { useTrackMutation } from '~/generated/graphql';

interface EventLocation {
  pathname: string;
}

export interface EventData {
  location: EventLocation;
}

export const useEventTracker = () => {
  const [createEventMutation] = useTrackMutation();

  return useCallback(
    (eventType: string, eventData: EventData) => {
      createEventMutation({
        variables: {
          type: eventType,
          data: eventData,
        },
      });
    },
    [createEventMutation],
  );
};
