import { CustomException } from 'src/utils/custom-exception';

export class PublicDomainException extends CustomException<PublicDomainExceptionCode> {}

export enum PublicDomainExceptionCode {
  PUBLIC_DOMAIN_ALREADY_REGISTERED = 'PUBLIC_DOMAIN_ALREADY_REGISTERED',
  DOMAIN_ALREADY_REGISTERED_AS_CUSTOM_DOMAIN = 'DOMAIN_ALREADY_REGISTERED_AS_CUSTOM_DOMAIN',
}
