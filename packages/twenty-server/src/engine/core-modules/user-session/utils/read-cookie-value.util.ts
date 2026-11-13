import { isNonEmptyString } from '@sniptt/guards';

export const readCookieValue = ({
  cookieHeader,
  cookieName,
}: {
  cookieHeader: string;
  cookieName: string;
}): string | undefined => {
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
