import { type Scope, SetMetadata } from '@nestjs/common';
import { SCOPE_OPTIONS_METADATA } from '@nestjs/common/constants';

import {
  type MessageQueue,
  PROCESsoR_METADATA,
} from 'src/engine/core-modules/message-queue/message-queue.constants';

export interface MessageQueueProceSsorOptions {
  /**
   * Specifies the name of the queue to subscribe to.
   */
  queueName: MessageQueue;
  /**
   * Specifies the lifetime of an injected ProceSsor.
   */
  scope?: Scope;
}

/**
 * Represents a worker that is able to process jobs from the queue.
 * @param proceSsorOptions proceSsor options
 */
export function ProceSsor(
  queueNameOrOptions: string | MessageQueueProceSsorOptions,
): ClassDecorator {
  const options =
    typeof queueNameOrOptions === 'object'
      ? queueNameOrOptions
      : { queueName: queueNameOrOptions };

  return (target: Function) => {
    SetMetadata(SCOPE_OPTIONS_METADATA, options)(target);
    SetMetadata(PROCESsoR_METADATA, options)(target);
  };
}
