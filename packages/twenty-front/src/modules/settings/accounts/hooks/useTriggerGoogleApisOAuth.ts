import { useCallback } from 'react';

import { AppPath } from '@/types/AppPath';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import {
  CalendarChannelVisibility,
  MessageChannelVisibility,
  useGenerateTransientTokenMutation,
} from '~/generated/graphql';

export const useTriggerGoogleApisOAuth = () => {
  const [generateTransientToken] = useGenerateTransientTokenMutation();

  const triggerGoogleApisOAuth = useCallback(
    async ({
      redirectLocation,
      messageVisibility,
      calendarVisibility,
      loginHint,
    }: {
      redirectLocation?: AppPath | string;
      messageVisibility?: MessageChannelVisibility;
      calendarVisibility?: CalendarChannelVisibility;
      loginHint?: string;
    } = {}) => {
      const authServerUrl = REACT_APP_SERVER_BASE_URL;

      const transientToken = await generateTransientToken();

      const token =
        transientToken.data?.generateTransientToken.transientToken.token;

      let params = `transientToken=${token}`;

      params += redirectLocation
        ? `&redirectLocation=${encodeURIComponent(redirectLocation)}`
        : '';

      params += calendarVisibility
        ? `&calendarVisibility=${calendarVisibility}`
        : '';

      params += messageVisibility
        ? `&messageVisibility=${messageVisibility}`
        : '';

      params += loginHint ? `&loginHint=${loginHint}` : '';

      window.location.href = `${authServerUrl}/auth/google-apis?${params}`;
    },
    [generateTransientToken],
  );

  return { triggerGoogleApisOAuth };
};
