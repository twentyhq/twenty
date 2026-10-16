import { useCallback } from 'react';
import { v4 } from 'uuid';
import { useMutation } from '@apollo/client/react';
import {
  AnalyticsType,
  type MutationTrackAnalyticsArgs,
  TrackAnalyticsDocument,
} from '~/generated-metadata/graphql';

export const ANALYTICS_COOKIE_NAME = 'analyticsCookie';
export const getSessionId = (): string => {
  const cookie: { [key: string]: string } = {};
  document.cookie.split(';').forEach((el) => {
    const [key, value] = el.split('=');
    cookie[key.trim()] = value;
  });
  return cookie[ANALYTICS_COOKIE_NAME];
};

export const setSessionId = (domain?: string): void => {
  const sessionId = getSessionId() || v4();
  // oxlint-disable-next-line lingui/no-unlocalized-strings -- This is a browser cookie attribute string.
  const baseCookie = `${ANALYTICS_COOKIE_NAME}=${sessionId}; Max-Age=1800; path=/; secure`;
  // oxlint-disable-next-line lingui/no-unlocalized-strings -- This is a browser cookie attribute string.
  const cookie = domain ? baseCookie + `; domain=${domain}` : baseCookie;

  document.cookie = cookie;
};

export const useEventTracker = () => {
  const [createEventMutation] = useMutation(TrackAnalyticsDocument);

  return useCallback(
    (
      type: AnalyticsType,
      payload: Omit<MutationTrackAnalyticsArgs, 'type'>,
    ) => {
      createEventMutation({
        variables: {
          type,
          ...payload,
          properties: {
            ...payload.properties,
            ...(type === AnalyticsType['PAGEVIEW']
              ? { sessionId: getSessionId() }
              : {}),
          },
        },
      });
    },
    [createEventMutation],
  );
};
