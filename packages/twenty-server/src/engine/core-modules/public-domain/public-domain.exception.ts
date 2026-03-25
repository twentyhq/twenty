import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum PublicDomainExceptionCode {
  PUBLIC_DOMAIN_ALREADY_REGISTERED = 'PUBLIC_DOMAIN_ALREADY_REGISTERED',
  DOMAIN_ALREADY_REGISTERED_AS_CUSTOM_DOMAIN = 'DOMAIN_ALREADY_REGISTERED_AS_CUSTOM_DOMAIN',
  PUBLIC_DOMAIN_NOT_FOUND = 'PUBLIC_DOMAIN_NOT_FOUND',
}

const getPublicDomainExceptionUserFriendlyMessage = (
  code: PublicDomainExceptionCode,
) => {
  switch (code) {
    case PublicDomainExceptionCode.PUBLIC_DOMAIN_ALREADY_REGISTERED:
      return msg`This public domain is already registered.`;
    case PublicDomainExceptionCode.DOMAIN_ALREADY_REGISTERED_AS_CUSTOM_DOMAIN:
      return msg`This domain is already registered as a custom domain.`;
    case PublicDomainExceptionCode.PUBLIC_DOMAIN_NOT_FOUND:
      return msg`Public domain not found.`;
    default:
      assertUnreachable(code);
  }
};

export class PublicDomainException extends CustomException<PublicDomainExceptionCode> {
  constructor(
    message: string,
    code: PublicDomainExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ??
        getPublicDomainExceptionUserFriendlyMessage(code),
    });
  }
}
