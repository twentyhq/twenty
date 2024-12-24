import { CustomException } from 'src/utils/custom-exception';

export class DomainManagerException extends CustomException {
  constructor(message: string, code: DomainManagerExceptionCode) {
    super(message, code);
  }
}

export enum DomainManagerExceptionCode {
  SUBDOMAIN_REQUIRED = 'SUBDOMAIN_REQUIRED',
}
