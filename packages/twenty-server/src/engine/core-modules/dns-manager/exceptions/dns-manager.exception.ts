import {
  appendCommonExceptionCode,
  CustomException,
} from 'src/utils/custom-exception';

export class DnsManagerException extends CustomException<
  keyof typeof DnsManagerExceptionCode,
  true
> {}

export const DnsManagerExceptionCode = appendCommonExceptionCode({
  HOSTNAME_ALREADY_REGISTERED: 'HOSTNAME_ALREADY_REGISTERED',
  HOSTNAME_NOT_REGISTERED: 'HOSTNAME_NOT_REGISTERED',
  INVALID_INPUT_DATA: 'INVALID_INPUT_DATA',
  CLOUDFLARE_CLIENT_NOT_INITIALIZED: 'CLOUDFLARE_CLIENT_NOT_INITIALIZED',
  MULTIPLE_HOSTNAMES_FOUND: 'MULTIPLE_HOSTNAMES_FOUND',
  MISSING_PUBLIC_DOMAIN_URL: 'MISSING_PUBLIC_DOMAIN_URL',
} as const);
