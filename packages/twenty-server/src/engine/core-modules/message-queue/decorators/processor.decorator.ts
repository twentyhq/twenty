import { type Scope, SetMetadata } from '@nestjs/common';
import { SCOPE_OPTIONS_METADATA } from '@nestjs/common/constants';

import {
  type MessageQueue,
  PROCESSOR_METADATA,
} from 'src/engine/core-modules/message-queue/message-queue.constants';

export interface MessageQueueProcessorOptions {
  /**
   * Specifies the name of the queue, or queues, to subscribe to.
   */
  queueName: MessageQueue | MessageQueue[];
  /**
   * Specifies the lifetime of an injected Processor.
   */
  scope?: Scope;
}

export function Processor(
  queueNameOrOptions: string | MessageQueue[] | MessageQueueProcessorOptions,
): ClassDecorator {
  const options =
    typeof queueNameOrOptions === 'string' || Array.isArray(queueNameOrOptions)
      ? { queueName: queueNameOrOptions }
      : queueNameOrOptions;

  return (target: Function) => {
    SetMetadata(SCOPE_OPTIONS_METADATA, options)(target);
    SetMetadata(PROCESSOR_METADATA, options)(target);
  };
}
