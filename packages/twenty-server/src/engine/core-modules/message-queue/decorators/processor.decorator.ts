import { type Scope, SetMetadata } from '@nestjs/common';
import { SCOPE_OPTIONS_METADATA } from '@nestjs/common/constants';

import {
  type MessageQueue,
  PROCESSOR_METADATA,
} from 'src/engine/core-modules/message-queue/message-queue.constants';

export interface MessageQueueProcessorOptions {
  queueName: MessageQueue;
  scope?: Scope;
}

export function Processor(
  queueNameOrOptions: string | MessageQueueProcessorOptions,
): ClassDecorator {
  const options =
    typeof queueNameOrOptions === 'object'
      ? queueNameOrOptions
      : { queueName: queueNameOrOptions };

  return (target: Function) => {
    SetMetadata(SCOPE_OPTIONS_METADATA, options)(target);
    SetMetadata(PROCESSOR_METADATA, options)(target);
  };
}
