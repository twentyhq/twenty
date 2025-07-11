import { Scope, SetMetadata } from '@nestjs/common';
import { SCOPE_OPTIONS_METADATA } from '@nestjs/common/constants';

import {
  MessageQueue,
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
 * @param queueName name of the queue to process
 */
export function Processor(queueName: MessageQueue): ClassDecorator;
/**
 * Represents a worker that is able to process jobs from the queue.
 * @param processorOptions processor options
 */
export function Processor(
  processorOptions: MessageQueueProcessorOptions,
): ClassDecorator;
export function Processor(
  queueNameOrOptions: string | MessageQueueProcessorOptions,
): ClassDecorator {
  const options =
    typeof queueNameOrOptions === 'object'
      ? queueNameOrOptions
      : { queueName: queueNameOrOptions };

  // eslint-disable-next-line @typescript-eslint/ban-types
  return (target: Function) => {
    SetMetadata(SCOPE_OPTIONS_METADATA, options)(target);
    SetMetadata(PROCESSOR_METADATA, options)(target);
  };
}
