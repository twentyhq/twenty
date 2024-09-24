import { useCallback } from 'react';
import { useTrackMutation } from '~/generated/graphql';
export interface EventData {
  pathname: string;
  userAgent: string;
  timeZone: string;
  locale: string;
  href: string;
  referrer: string;
}

export const getSessionId = (cookieName: string): string => {
  const cookie: { [key: string]: string } = {};
  document.cookie.split(';').forEach((el) => {
    const [key, value] = el.split('=');
    cookie[key.trim()] = value;
  });
  return cookie[cookieName];
};

export const setSessionId = (cookieName: string, domain?: string): void => {
  const sessionId = getSessionId(cookieName) || crypto.randomUUID();
  const baseCookie = `${cookieName}=${sessionId}; Max-Age=1800; path=/; secure`;
  const cookie = domain ? baseCookie + `; domain=${domain}` : baseCookie;

  document.cookie = cookie;
};

export const useEventTracker = () => {
  const [createEventMutation] = useTrackMutation();

  return useCallback(
    (eventType: string, sessionId: string, eventData: EventData) => {
      createEventMutation({
        variables: {
          type: eventType,
          sessionId: sessionId,
          data: eventData,
        },
      });
    },
    [createEventMutation],
  );
};
