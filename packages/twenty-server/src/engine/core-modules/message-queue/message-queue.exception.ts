import { HttpStatus } from '@nestjs/common';

import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum MessageQueueExceptionCode {
  JOB_TOO_LARGE = 'JOB_TOO_LARGE',
}

export type JobTooLargeDetails = {
  index: number;
  sizeBytes: number;
  maxBytes: number;
};

const getMessageQueueExceptionUserFriendlyMessage = (
  code: MessageQueueExceptionCode,
): MessageDescriptor => {
  switch (code) {
    case MessageQueueExceptionCode.JOB_TOO_LARGE:
      return msg`This job is too large to be enqueued.`;
    default:
      return assertUnreachable(code);
  }
};

const getMessageQueueExceptionStatusCode = (
  code: MessageQueueExceptionCode,
): number => {
  switch (code) {
    case MessageQueueExceptionCode.JOB_TOO_LARGE:
      return HttpStatus.PAYLOAD_TOO_LARGE;
    default:
      return assertUnreachable(code);
  }
};

export class MessageQueueException extends CustomException<MessageQueueExceptionCode> {
  readonly details: JobTooLargeDetails;

  constructor(
    message: string,
    code: MessageQueueExceptionCode,
    details: JobTooLargeDetails,
  ) {
    super(message, code, {
      userFriendlyMessage: getMessageQueueExceptionUserFriendlyMessage(code),
      statusCode: getMessageQueueExceptionStatusCode(code),
    });
    this.details = details;
  }
}
