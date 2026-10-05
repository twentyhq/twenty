import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import {
  CustomException,
  type ExceptionCategory,
} from 'src/utils/custom-exception';

import { type ExhaustedScope } from 'src/engine/core-modules/usage-limit/types/exhausted-scope.type';

export enum UsageLimitExceptionCode {
  RATE_LIMITED = 'RATE_LIMITED',
  QUOTA_EXHAUSTED = 'QUOTA_EXHAUSTED',
  STOCK_EXHAUSTED = 'STOCK_EXHAUSTED',
  LIMIT_INVALID = 'LIMIT_INVALID',
  LIMIT_NOT_ENTITLED = 'LIMIT_NOT_ENTITLED',
  LIMIT_FORBIDDEN = 'LIMIT_FORBIDDEN',
  LIMIT_CONFLICT = 'LIMIT_CONFLICT',
}

const getUsageLimitExceptionUserFriendlyMessage = (
  code: UsageLimitExceptionCode,
) => {
  switch (code) {
    case UsageLimitExceptionCode.RATE_LIMITED:
      return msg`Rate limit reached. Please try again later.`;
    case UsageLimitExceptionCode.QUOTA_EXHAUSTED:
      return msg`Usage quota exhausted for this period.`;
    case UsageLimitExceptionCode.STOCK_EXHAUSTED:
      return msg`This workspace has reached its storage limit.`;
    case UsageLimitExceptionCode.LIMIT_INVALID:
      return msg`This limit cannot be saved.`;
    case UsageLimitExceptionCode.LIMIT_NOT_ENTITLED:
      return msg`Limits scoped below the workspace require the Organization plan.`;
    case UsageLimitExceptionCode.LIMIT_FORBIDDEN:
      return msg`Only an operator can replace an instance default.`;
    case UsageLimitExceptionCode.LIMIT_CONFLICT:
      return msg`This limit changed while you were editing it. Reload and try again.`;
    default:
      assertUnreachable(code);
  }
};
const USAGE_LIMIT_EXCEPTION_CATEGORY_BY_CODE = {
  [UsageLimitExceptionCode.RATE_LIMITED]: 'RATE_LIMITED',
  [UsageLimitExceptionCode.QUOTA_EXHAUSTED]: 'QUOTA_EXHAUSTED',
  [UsageLimitExceptionCode.STOCK_EXHAUSTED]: 'QUOTA_EXHAUSTED',
  [UsageLimitExceptionCode.LIMIT_INVALID]: 'BAD_USER_INPUT',
  [UsageLimitExceptionCode.LIMIT_NOT_ENTITLED]: 'FORBIDDEN',
  [UsageLimitExceptionCode.LIMIT_FORBIDDEN]: 'FORBIDDEN',
  [UsageLimitExceptionCode.LIMIT_CONFLICT]: 'CONFLICT',
} as const satisfies Record<UsageLimitExceptionCode, ExceptionCategory>;

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
      category: USAGE_LIMIT_EXCEPTION_CATEGORY_BY_CODE[code],
    });
    this.exhaustedScope = exhaustedScope;
  }
}
