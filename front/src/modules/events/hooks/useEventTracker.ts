import { useCallback } from 'react';

import { useCreateEventMutation } from '~/generated/graphql';

import { useIsTelemetryEnabled } from './useIsTelemetryEnabled';

export function useEventTracker() {
  const telemetryEnabled = useIsTelemetryEnabled();
  const [createEventMutation] = useCreateEventMutation();

  return useCallback(
    (eventType: string, eventData: any) => {
      if (telemetryEnabled) {
        createEventMutation({
          variables: {
            type: eventType,
            data: JSON.stringify(eventData),
          },
        });
      }
    },
    [createEventMutation, telemetryEnabled],
  );
}
