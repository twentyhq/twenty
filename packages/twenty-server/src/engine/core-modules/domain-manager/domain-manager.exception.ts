import { CustomException } from 'src/utils/custom-exception';

export class DomainManagerException extends CustomException {
  constructor(message: string, code: DomainManagerExceptionCode) {
    super(message, code);
  }
}

export enum DomainManagerExceptionCode {
  CLOUDFLARE_CLIENT_NOT_INITIALIZED = 'CLOUDFLARE_CLIENT_NOT_INITIALIZED',
  DOMAIN_ALREADY_REGISTERED = 'DOMAIN_ALREADY_REGISTERED',
}
