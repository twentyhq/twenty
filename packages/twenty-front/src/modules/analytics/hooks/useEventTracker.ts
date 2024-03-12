import { useCallback } from 'react';
import { useRecoilValue } from 'recoil';

import { telemetryState } from '@/client-config/states/telemetryState';
import { useCreateEventMutation } from '~/generated/graphql';

interface EventLocation {
  pathname: string;
}

export interface EventData {
  location: EventLocation;
}

export const useEventTracker = () => {
  const telemetry = useRecoilValue(telemetryState());
  const [createEventMutation] = useCreateEventMutation();

  return useCallback(
    (eventType: string, eventData: EventData) => {
      if (telemetry.enabled) {
        createEventMutation({
          variables: {
            type: eventType,
            data: eventData,
          },
        });
      }
    },
    [createEventMutation, telemetry],
  );
};
