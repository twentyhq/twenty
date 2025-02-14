import { CustomException } from 'src/utils/custom-exception';

export class DomainManagerException extends CustomException {
  constructor(message: string, code: DomainManagerExceptionCode) {
    super(message, code);
  }
}

export enum DomainManagerExceptionCode {
  CLOUDFLARE_CLIENT_NOT_INITIALIZED = 'CLOUDFLARE_CLIENT_NOT_INITIALIZED',
  HOSTNAME_ALREADY_REGISTERED = 'HOSTNAME_ALREADY_REGISTERED',
  SUBDOMAIN_REQUIRED = 'SUBDOMAIN_REQUIRED',
  INVALID_INPUT_DATA = 'INVALID_INPUT_DATA',
}
