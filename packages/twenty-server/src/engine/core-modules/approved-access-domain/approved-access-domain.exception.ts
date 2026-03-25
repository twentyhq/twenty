import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum ApprovedAccessDomainExceptionCode {
  APPROVED_ACCESS_DOMAIN_NOT_FOUND = 'APPROVED_ACCESS_DOMAIN_NOT_FOUND',
  APPROVED_ACCESS_DOMAIN_ALREADY_VERIFIED = 'APPROVED_ACCESS_DOMAIN_ALREADY_VERIFIED',
  APPROVED_ACCESS_DOMAIN_ALREADY_REGISTERED = 'APPROVED_ACCESS_DOMAIN_ALREADY_REGISTERED',
  APPROVED_ACCESS_DOMAIN_DOES_NOT_MATCH_DOMAIN_EMAIL = 'APPROVED_ACCESS_DOMAIN_DOES_NOT_MATCH_DOMAIN_EMAIL',
  APPROVED_ACCESS_DOMAIN_VALIDATION_TOKEN_INVALID = 'APPROVED_ACCESS_DOMAIN_VALIDATION_TOKEN_INVALID',
  APPROVED_ACCESS_DOMAIN_ALREADY_VALIDATED = 'APPROVED_ACCESS_DOMAIN_ALREADY_VALIDATED',
  APPROVED_ACCESS_DOMAIN_MUST_BE_A_COMPANY_DOMAIN = 'APPROVED_ACCESS_DOMAIN_MUST_BE_A_COMPANY_DOMAIN',
}

const getApprovedAccessDomainExceptionUserFriendlyMessage = (
  code: ApprovedAccessDomainExceptionCode,
) => {
  switch (code) {
    case ApprovedAccessDomainExceptionCode.APPROVED_ACCESS_DOMAIN_NOT_FOUND:
      return msg`Approved access domain not found.`;
    case ApprovedAccessDomainExceptionCode.APPROVED_ACCESS_DOMAIN_ALREADY_VERIFIED:
      return msg`This domain has already been verified.`;
    case ApprovedAccessDomainExceptionCode.APPROVED_ACCESS_DOMAIN_ALREADY_REGISTERED:
      return msg`This domain is already registered.`;
    case ApprovedAccessDomainExceptionCode.APPROVED_ACCESS_DOMAIN_DOES_NOT_MATCH_DOMAIN_EMAIL:
      return msg`The domain does not match your email domain.`;
    case ApprovedAccessDomainExceptionCode.APPROVED_ACCESS_DOMAIN_VALIDATION_TOKEN_INVALID:
      return msg`Invalid validation token.`;
    case ApprovedAccessDomainExceptionCode.APPROVED_ACCESS_DOMAIN_ALREADY_VALIDATED:
      return msg`This domain has already been validated.`;
    case ApprovedAccessDomainExceptionCode.APPROVED_ACCESS_DOMAIN_MUST_BE_A_COMPANY_DOMAIN:
      return msg`Please use a company email domain.`;
    default:
      assertUnreachable(code);
  }
};

export class ApprovedAccessDomainException extends CustomException<ApprovedAccessDomainExceptionCode> {
  constructor(
    message: string,
    code: ApprovedAccessDomainExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ??
        getApprovedAccessDomainExceptionUserFriendlyMessage(code),
    });
  }
}
