import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import {
  CustomException,
  type ExceptionCategory,
} from 'src/utils/custom-exception';

export enum EventLogEmitterExceptionCode {
  INVALID_TYPE = 'INVALID_TYPE',
  INVALID_INPUT = 'INVALID_INPUT',
}

const getEventLogEmitterExceptionUserFriendlyMessage = (
  code: EventLogEmitterExceptionCode,
) => {
  switch (code) {
    case EventLogEmitterExceptionCode.INVALID_TYPE:
      return msg`Invalid event type.`;
    case EventLogEmitterExceptionCode.INVALID_INPUT:
      return msg`Invalid event input.`;
    default:
      assertUnreachable(code);
  }
};
const EVENT_LOG_EMITTER_EXCEPTION_CATEGORY_BY_CODE = {
  [EventLogEmitterExceptionCode.INVALID_TYPE]: 'BAD_USER_INPUT',
  [EventLogEmitterExceptionCode.INVALID_INPUT]: 'BAD_USER_INPUT',
} as const satisfies Record<EventLogEmitterExceptionCode, ExceptionCategory>;

export class EventLogEmitterException extends CustomException<EventLogEmitterExceptionCode> {
  constructor(
    message: string,
    code: EventLogEmitterExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ??
        getEventLogEmitterExceptionUserFriendlyMessage(code),
      category: EVENT_LOG_EMITTER_EXCEPTION_CATEGORY_BY_CODE[code],
    });
  }
}
