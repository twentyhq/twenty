import { AppPath } from '@/types/AppPath';
import { useCallback } from 'react';

import { REACT_APP_SERVER_BASE_URL } from '~/config';
import {
  CalendarChannelVisibility,
  MessageChannelVisibility,
  useGenerateTransientTokenMutation,
} from '~/generated/graphql';
import { useRedirect } from '@/domain-manager/hooks/useRedirect';

const getProviderUrl = (provider: string) => {
  switch (provider) {
    case 'google':
      return 'google-apis';
    case 'microsoft':
      return 'microsoft-apis';
    default:
      throw new Error(`Provider ${provider} is not supported`);
  }
};

export const useTriggerApisOAuth = () => {
  const [generateTransientToken] = useGenerateTransientTokenMutation();
  const { redirect } = useRedirect();

  const triggerApisOAuth = useCallback(
    async (
      provider: string,
      {
        redirectLocation,
        messageVisibility,
        calendarVisibility,
        loginHint,
      }: {
        redirectLocation?: AppPath | string;
        messageVisibility?: MessageChannelVisibility;
        calendarVisibility?: CalendarChannelVisibility;
        loginHint?: string;
      } = {},
    ) => {
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

      redirect(`${authServerUrl}/auth/${getProviderUrl(provider)}?${params}`);
    },
    [generateTransientToken, redirect],
  );

  return { triggerApisOAuth };
};
