import { type ArgumentsHost } from '@nestjs/common';

import { type HttpExceptionHandlerService } from 'src/engine/core-modules/exception-handler/http-exception-handler.service';
import { MessageQueueRestApiExceptionFilter } from 'src/engine/core-modules/message-queue/filters/message-queue-rest-api-exception.filter';
import {
  MessageQueueException,
  MessageQueueExceptionCode,
} from 'src/engine/core-modules/message-queue/message-queue.exception';

describe('MessageQueueRestApiExceptionFilter', () => {
  it('answers 413 to a job that is too large, without reporting it to Sentry', () => {
    const handleError = jest.fn();
    const response = {};
    const filter = new MessageQueueRestApiExceptionFilter({
      handleError,
    } as unknown as HttpExceptionHandlerService);
    const exception = new MessageQueueException(
      'Job too large',
      MessageQueueExceptionCode.JOB_TOO_LARGE,
      { index: 0, sizeBytes: 2_000_000, maxBytes: 1_048_576 },
    );

    filter.catch(exception, {
      switchToHttp: () => ({ getResponse: () => response }),
    } as unknown as ArgumentsHost);

    expect(handleError).toHaveBeenCalledWith(
      exception,
      response,
      413,
      undefined,
      undefined,
      { shouldBeCapturedBySentry: false },
    );
  });

  it('answers 429 when the job queue memory limit is reached, without reporting it to Sentry', () => {
    const handleError = jest.fn();
    const response = {};
    const filter = new MessageQueueRestApiExceptionFilter({
      handleError,
    } as unknown as HttpExceptionHandlerService);
    const exception = new MessageQueueException(
      'Job memory limit reached',
      MessageQueueExceptionCode.JOB_QUEUE_MEMORY_LIMIT_REACHED,
      {
        requestedBytes: 2_000,
        availableBytes: 0,
        refusedGroupKeys: ['workspace:ws-1'],
      },
    );

    filter.catch(exception, {
      switchToHttp: () => ({ getResponse: () => response }),
    } as unknown as ArgumentsHost);

    expect(handleError).toHaveBeenCalledWith(
      exception,
      response,
      429,
      undefined,
      undefined,
      { shouldBeCapturedBySentry: false },
    );
  });
});
