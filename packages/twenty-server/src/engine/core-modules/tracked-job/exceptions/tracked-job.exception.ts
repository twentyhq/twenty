import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { CustomException } from 'src/utils/custom-exception';

type TrackedJobExceptionCode =
  | 'QUEUE_UNAVAILABLE'
  | 'DURATION_LIMIT_EXCEEDED'
  | 'CONNECTION_CLOSED'
  | 'PAGINATION_FAILED'
  | 'RECORD_COUNT_UNAVAILABLE';

export class TrackedJobException extends CustomException<TrackedJobExceptionCode> {
  constructor(
    message: string,
    code: TrackedJobExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ?? msg`Something went wrong. Please try again.`,
    });
  }
}
