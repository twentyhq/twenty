import { useCallback } from 'react';
import { v4 } from 'uuid';
import {
  AnalyticsType,
  type MutationTrackAnalyticsArgs,
  useTrackAnalyticsMutation,
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
  const baseCookie = `${ANALYTICS_COOKIE_NAME}=${sessionId}; Max-Age=1800; path=/; secure`;
  const cookie = domain ? baseCookie + `; domain=${domain}` : baseCookie;

  document.cookie = cookie;
};

export const useEventTracker = () => {
  const [createEventMutation] = useTrackAnalyticsMutation();

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
