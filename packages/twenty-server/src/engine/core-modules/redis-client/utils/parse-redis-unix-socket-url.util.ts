import { isNonEmptyString } from '@sniptt/guards';

export const parseRedisUnixSocketUrl = (url: string) => {
  if (!url.startsWith('unix://')) {
    return null;
  }

  const { pathname, searchParams } = new URL(url);
  const db = searchParams.get('db');
  const username = searchParams.get('username');
  const password = searchParams.get('password');

  return {
    path: pathname,
    ...(isNonEmptyString(db) && { db: Number(db) }),
    ...(isNonEmptyString(username) && { username }),
    ...(isNonEmptyString(password) && { password }),
  };
};
