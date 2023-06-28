import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { useCreateEventMutation } from '~/generated/graphql';

import { useIsTelemetryEnabled } from './useIsTelemetryEnabled';

export function useTrackPageView() {
  const location = useLocation();
  const telemetryEnabled = useIsTelemetryEnabled();

  const [createEventMutation] = useCreateEventMutation();

  useEffect(() => {
    if (!telemetryEnabled) {
      return;
    }
    createEventMutation({
      variables: {
        type: 'pageview',
        data: JSON.stringify({
          location: location,
        }),
      },
    });
  }, [location, createEventMutation, telemetryEnabled]);
}
