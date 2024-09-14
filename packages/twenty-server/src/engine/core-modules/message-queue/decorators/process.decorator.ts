import { SetMetadata } from '@nestjs/common';
import { isString } from '@nestjs/common/utils/shared.utils';

import { PROCESS_METADATA } from 'src/engine/core-modules/message-queue/message-queue.constants';

export interface MessageQueueProcessOptions {
  jobName: string;
  concurrency?: number;
}

export function Process(jobName: string): MethodDecorator;
export function Process(options: MessageQueueProcessOptions): MethodDecorator;
export function Process(
  nameOrOptions: string | MessageQueueProcessOptions,
): MethodDecorator {
  const options = isString(nameOrOptions)
    ? { jobName: nameOrOptions }
    : nameOrOptions;

  return SetMetadata(PROCESS_METADATA, options || {});
}
