import { type Scope, SetMetadata } from '@nestjs/common';
import { SCOPE_OPTIONS_METADATA } from '@nestjs/common/constants';

import {
  type MessageQueue,
  PROCESSOR_METADATA,
} from 'src/engine/core-modules/message-queue/message-queue.constants';

export interface MessageQueueProcessorOptions {
  /**
   * Specifies the name of the queue to subscribe to.
   */
  queueName: MessageQueue;
  /**
   * Specifies the lifetime of an injected Processor.
   */
  scope?: Scope;
}

/**
 * Represents a worker that is able to process jobs from the queue.
 * @param processorOptions processor options
 */
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
