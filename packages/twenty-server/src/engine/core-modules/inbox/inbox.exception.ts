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
  UNKNOWN_INBOX_QUEUE: 'UNKNOWN_INBOX_QUEUE',
  UNKNOWN_INBOX_RECIPIENT: 'UNKNOWN_INBOX_RECIPIENT',
  INBOX_ITEM_NOT_FOUND: 'INBOX_ITEM_NOT_FOUND',
  INBOX_ITEM_CHANGED: 'INBOX_ITEM_CHANGED',
  INVALID_INBOX_ACTION: 'INVALID_INBOX_ACTION',
  INVALID_INBOX_QUEUE_CHANGE: 'INVALID_INBOX_QUEUE_CHANGE',
  INBOX_DISABLED: 'INBOX_DISABLED',
} as const);

const getInboxExceptionUserFriendlyMessage = (
  code: keyof typeof InboxExceptionCode,
) => {
  switch (code) {
    case InboxExceptionCode.UNKNOWN_INBOX_ITEM_TYPE:
      return msg`This kind of inbox item is not declared.`;
    case InboxExceptionCode.UNKNOWN_INBOX_QUEUE:
      return msg`This shared inbox does not exist, or you are not a member.`;
    case InboxExceptionCode.UNKNOWN_INBOX_RECIPIENT:
      return msg`This person is not a member of this workspace.`;
    case InboxExceptionCode.INBOX_ITEM_NOT_FOUND:
      return msg`This inbox item no longer exists.`;
    case InboxExceptionCode.INBOX_ITEM_CHANGED:
      return msg`Someone else worked on this item. Reload and try again.`;
    case InboxExceptionCode.INVALID_INBOX_ACTION:
      return msg`This action cannot be run on this item.`;
    case InboxExceptionCode.INVALID_INBOX_QUEUE_CHANGE:
      return msg`This shared inbox cannot be changed that way.`;
    case InboxExceptionCode.INBOX_DISABLED:
      return msg`The inbox is not enabled for this workspace.`;
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
