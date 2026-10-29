import { isNonEmptyString } from '@sniptt/guards';
import { type Request } from 'express';

export type CloudflareGeolocation = {
  country: string | null;
  region: string | null;
  city: string | null;
};

// XX is Cloudflare's "unknown" and T1 is Tor: neither is an ISO 3166 country.
const UNKNOWN_COUNTRY_CODES = new Set(['XX', 'T1']);

// Cloudflare sends non-ASCII values as raw UTF-8 bytes, which Node reads as latin1.
type RequestWithHeaders = Pick<Request, 'headers'>;

const readUtf8Header = ({
  request,
  headerName,
}: {
  request: RequestWithHeaders;
  headerName: string;
}): string | null => {
  const value = request.headers[headerName];

  if (!isNonEmptyString(value)) {
    return null;
  }

  const decodedValue = Buffer.from(value, 'latin1').toString('utf8').trim();

  return isNonEmptyString(decodedValue) ? decodedValue : null;
};

const readCountryCode = (request: RequestWithHeaders): string | null => {
  const countryCode = readUtf8Header({
    request,
    headerName: 'cf-ipcountry',
  })?.toUpperCase();

  if (
    !isNonEmptyString(countryCode) ||
    !/^[A-Z]{2}$/.test(countryCode) ||
    UNKNOWN_COUNTRY_CODES.has(countryCode)
  ) {
    return null;
  }

  return countryCode;
};

export const extractCloudflareGeolocationFromRequest = (
  request: RequestWithHeaders,
): CloudflareGeolocation => ({
  country: readCountryCode(request),
  region: readUtf8Header({ request, headerName: 'cf-region' }),
  city: readUtf8Header({ request, headerName: 'cf-ipcity' }),
});
