import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { STANDARD_ERROR_MESSAGE } from 'src/engine/api/common/common-query-runners/errors/standard-error-message.constant';
import {
  appendCommonExceptionCode,
  CustomException,
} from 'src/utils/custom-exception';

export const InboxExceptionCode = appendCommonExceptionCode({
  UNKNOWN_INBOX_ITEM_TYPE: 'UNKNOWN_INBOX_ITEM_TYPE',
} as const);

const getInboxExceptionUserFriendlyMessage = (
  code: keyof typeof InboxExceptionCode,
) => {
  switch (code) {
    case InboxExceptionCode.UNKNOWN_INBOX_ITEM_TYPE:
      return msg`This kind of inbox item is not declared.`;
    case InboxExceptionCode.INTERNAL_SERVER_ERROR:
      return STANDARD_ERROR_MESSAGE;
    default:
      assertUnreachable(code);
  }
};

export class InboxException extends CustomException<
  keyof typeof InboxExceptionCode
> {
  constructor(
    message: string,
    code: keyof typeof InboxExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ?? getInboxExceptionUserFriendlyMessage(code),
    });
  }
}
