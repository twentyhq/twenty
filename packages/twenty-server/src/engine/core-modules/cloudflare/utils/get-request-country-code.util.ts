import { type Request } from 'express';

// Cloudflare sends XX when it cannot locate the client and T1 for Tor exit nodes
const UNKNOWN_COUNTRY_CODES = ['XX', 'T1'];

export const getRequestCountryCode = (
  request: Pick<Request, 'headers'>,
): string | null => {
  const countryCode = request.headers['cf-ipcountry'];

  if (
    typeof countryCode !== 'string' ||
    !/^[A-Z]{2}$/.test(countryCode) ||
    UNKNOWN_COUNTRY_CODES.includes(countryCode)
  ) {
    return null;
  }

  return countryCode;
};
