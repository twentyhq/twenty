import { useCallback } from 'react';

import { useCreateEventMutation } from '~/generated/graphql';

import { useIsTelemetryEnabled } from './useIsTelemetryEnabled';

interface EventLocation {
  pathname: string;
}

export interface EventData {
  location: EventLocation;
}

export function useEventTracker() {
  const telemetryEnabled = useIsTelemetryEnabled();
  const [createEventMutation] = useCreateEventMutation();

  return useCallback(
    (eventType: string, eventData: EventData) => {
      if (telemetryEnabled) {
        createEventMutation({
          variables: {
            type: eventType,
            data: eventData,
          },
        });
      }
    },
    [createEventMutation, telemetryEnabled],
  );
}
