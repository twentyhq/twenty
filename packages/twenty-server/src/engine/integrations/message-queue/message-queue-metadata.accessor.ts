/* eslint-disable @typescript-eslint/ban-types */
import { Injectable, Type } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { MessageQueueWorkerOptions } from 'src/engine/integrations/message-queue/interfaces/message-queue-worker-options.interface';

import { MessageQueueProcessOptions } from 'src/engine/integrations/message-queue/decorators/process.decorator';
import { MessageQueueProcessorOptions } from 'src/engine/integrations/message-queue/decorators/processor.decorator';
import {
  PROCESSOR_METADATA,
  PROCESS_METADATA,
  WORKER_METADATA,
} from 'src/engine/integrations/message-queue/message-queue.constants';

@Injectable()
export class MessageQueueMetadataAccessor {
  constructor(private readonly reflector: Reflector) {}

  isProcessor(target: Type<any> | Function): boolean {
    if (!target) {
      return false;
    }

    return !!this.reflector.get(PROCESSOR_METADATA, target);
  }

  isProcess(target: Type<any> | Function): boolean {
    if (!target) {
      return false;
    }

    return !!this.reflector.get(PROCESS_METADATA, target);
  }

  getProcessorMetadata(
    target: Type<any> | Function,
  ): MessageQueueProcessorOptions | undefined {
    return this.reflector.get(PROCESSOR_METADATA, target);
  }

  getProcessMetadata(
    target: Type<any> | Function,
  ): MessageQueueProcessOptions | undefined {
    const metadata = this.reflector.get(PROCESS_METADATA, target);

    return metadata;
  }

  getWorkerOptionsMetadata(
    target: Type<any> | Function,
  ): MessageQueueWorkerOptions {
    return this.reflector.get(WORKER_METADATA, target) ?? {};
  }
}
