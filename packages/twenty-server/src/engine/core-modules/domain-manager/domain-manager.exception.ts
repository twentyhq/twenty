import {
  appendCommonExceptionCode,
  CustomException,
} from 'src/utils/custom-exception';

export class DomainManagerException extends CustomException<
  keyof typeof DomainManagerExceptionCode,
  true
> {}

export const DomainManagerExceptionCode = appendCommonExceptionCode({
  CLOUDFLARE_CLIENT_NOT_INITIALIZED: 'CLOUDFLARE_CLIENT_NOT_INITIALIZED',
  HOSTNAME_ALREADY_REGISTERED: 'HOSTNAME_ALREADY_REGISTERED',
  INVALID_INPUT_DATA: 'INVALID_INPUT_DATA',
} as const);
