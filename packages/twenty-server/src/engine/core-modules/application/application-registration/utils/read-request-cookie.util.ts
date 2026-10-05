import { isNonEmptyString } from '@sniptt/guards';
import { type Request } from 'express';

export const readRequestCookie = (
  request: Request,
  cookieName: string,
): string | undefined => {
  const cookieHeader = request.headers.cookie;

  if (!isNonEmptyString(cookieHeader)) {
    return undefined;
  }

  for (const cookiePart of cookieHeader.split(';')) {
    const separatorIndex = cookiePart.indexOf('=');

    if (separatorIndex === -1) {
      continue;
    }

    if (cookiePart.slice(0, separatorIndex).trim() !== cookieName) {
      continue;
    }

    const value = cookiePart.slice(separatorIndex + 1).trim();

    if (isNonEmptyString(value)) {
      return value;
    }
  }

  return undefined;
};
