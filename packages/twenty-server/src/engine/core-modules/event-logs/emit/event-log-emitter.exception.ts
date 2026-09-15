import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

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
    });
  }
}
