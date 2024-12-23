import { useCallback } from 'react';
import { v4 } from 'uuid';
import { useTrackMutation } from '~/generated/graphql';
export interface EventData {
  pathname: string;
  userAgent: string;
  timeZone: string;
  locale: string;
  href: string;
  referrer: string;
}
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
  const [createEventMutation] = useTrackMutation();

  return useCallback(
    (eventAction: string, eventPayload: EventData) => {
      createEventMutation({
        variables: {
          action: eventAction,
          payload: {
            sessionId: getSessionId(),
            ...eventPayload,
          },
        },
      });
    },
    [createEventMutation],
  );
};
