import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

import { type ExhaustedScope } from 'src/engine/core-modules/usage-limit/types/exhausted-scope.type';

export enum UsageLimitExceptionCode {
  RATE_LIMITED = 'RATE_LIMITED',
  QUOTA_EXHAUSTED = 'QUOTA_EXHAUSTED',
  LIMIT_INVALID = 'LIMIT_INVALID',
}

const getUsageLimitExceptionUserFriendlyMessage = (
  code: UsageLimitExceptionCode,
) => {
  switch (code) {
    case UsageLimitExceptionCode.RATE_LIMITED:
      return msg`Rate limit reached. Please try again later.`;
    case UsageLimitExceptionCode.QUOTA_EXHAUSTED:
      return msg`Usage quota exhausted for this period.`;
    case UsageLimitExceptionCode.LIMIT_INVALID:
      return msg`This limit cannot be saved.`;
    default:
      assertUnreachable(code);
  }
};

export class UsageLimitException extends CustomException<UsageLimitExceptionCode> {
  readonly exhaustedScope?: ExhaustedScope;

  constructor(
    message: string,
    code: UsageLimitExceptionCode,
    {
      userFriendlyMessage,
      exhaustedScope,
    }: {
      userFriendlyMessage?: MessageDescriptor;
      exhaustedScope?: ExhaustedScope;
    } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ?? getUsageLimitExceptionUserFriendlyMessage(code),
    });
    this.exhaustedScope = exhaustedScope;
  }
}
