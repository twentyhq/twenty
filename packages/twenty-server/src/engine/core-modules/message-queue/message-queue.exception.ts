import { HttpStatus } from '@nestjs/common';

import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum MessageQueueExceptionCode {
  JOB_TOO_LARGE = 'JOB_TOO_LARGE',
  JOB_QUEUE_MEMORY_LIMIT_REACHED = 'JOB_QUEUE_MEMORY_LIMIT_REACHED',
}

export type JobTooLargeDetails = {
  index: number;
  sizeBytes: number;
  maxBytes: number;
};

export type JobQueueMemoryLimitReachedDetails = {
  requestedBytes: number;
  availableBytes: number;
  refusedGroupKeys: string[];
};

const getMessageQueueExceptionUserFriendlyMessage = (
  code: MessageQueueExceptionCode,
): MessageDescriptor => {
  switch (code) {
    case MessageQueueExceptionCode.JOB_TOO_LARGE:
      return msg`This job is too large to be enqueued.`;
    case MessageQueueExceptionCode.JOB_QUEUE_MEMORY_LIMIT_REACHED:
      return msg`Too many jobs are waiting. Please try again later.`;
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
    case MessageQueueExceptionCode.JOB_QUEUE_MEMORY_LIMIT_REACHED:
      return HttpStatus.TOO_MANY_REQUESTS;
    default:
      return assertUnreachable(code);
  }
};

export class MessageQueueException extends CustomException<MessageQueueExceptionCode> {
  readonly details: JobTooLargeDetails | JobQueueMemoryLimitReachedDetails;

  constructor(
    message: string,
    code: MessageQueueExceptionCode,
    details: JobTooLargeDetails | JobQueueMemoryLimitReachedDetails,
  ) {
    super(message, code, {
      userFriendlyMessage: getMessageQueueExceptionUserFriendlyMessage(code),
      statusCode: getMessageQueueExceptionStatusCode(code),
    });
    this.details = details;
  }
}
