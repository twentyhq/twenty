import { HttpStatus } from '@nestjs/common';

import { msg } from '@lingui/core/macro';

import { type JobTooLargeDetails } from 'src/engine/core-modules/message-queue/types/job-too-large-details.type';
import { CustomException } from 'src/utils/custom-exception';

export enum JobTooLargeExceptionCode {
  JOB_TOO_LARGE = 'JOB_TOO_LARGE',
}

export class JobTooLargeException extends CustomException<JobTooLargeExceptionCode> {
  readonly details: JobTooLargeDetails;

  constructor(details: JobTooLargeDetails) {
    super(
      `Job at index ${details.index} is ${details.sizeBytes} bytes, over the ${details.maxBytes} bytes limit`,
      JobTooLargeExceptionCode.JOB_TOO_LARGE,
      {
        userFriendlyMessage: msg`This job is too large to be queued.`,
        statusCode: HttpStatus.PAYLOAD_TOO_LARGE,
      },
    );
    this.details = details;
  }
}
