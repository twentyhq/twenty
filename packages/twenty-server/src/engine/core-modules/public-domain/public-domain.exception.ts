import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { CustomException } from 'src/utils/custom-exception';

export enum PublicDomainExceptionCode {
  PUBLIC_DOMAIN_ALREADY_REGISTERED = 'PUBLIC_DOMAIN_ALREADY_REGISTERED',
  DOMAIN_ALREADY_REGISTERED_AS_CUSTOM_DOMAIN = 'DOMAIN_ALREADY_REGISTERED_AS_CUSTOM_DOMAIN',
  PUBLIC_DOMAIN_NOT_FOUND = 'PUBLIC_DOMAIN_NOT_FOUND',
}

const publicDomainExceptionUserFriendlyMessages: Record<
  PublicDomainExceptionCode,
  MessageDescriptor
> = {
  [PublicDomainExceptionCode.PUBLIC_DOMAIN_ALREADY_REGISTERED]: msg`This public domain is already registered.`,
  [PublicDomainExceptionCode.DOMAIN_ALREADY_REGISTERED_AS_CUSTOM_DOMAIN]: msg`This domain is already registered as a custom domain.`,
  [PublicDomainExceptionCode.PUBLIC_DOMAIN_NOT_FOUND]: msg`Public domain not found.`,
};

export class PublicDomainException extends CustomException<PublicDomainExceptionCode> {
  constructor(
    message: string,
    code: PublicDomainExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ?? publicDomainExceptionUserFriendlyMessages[code],
    });
  }
}
