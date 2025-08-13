import { Injectable, type Type } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { type MessageQueueProcessOptions } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { type MessageQueueProcessorOptions } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import {
  PROCESSOR_METADATA,
  PROCESS_METADATA,
} from 'src/engine/core-modules/message-queue/message-queue.constants';

@Injectable()
export class MessageQueueMetadataAccessor {
  constructor(private readonly reflector: Reflector) {}

  isProcessor(target: Type | Function): boolean {
    if (!target) {
      return false;
    }

    return !!this.reflector.get(PROCESSOR_METADATA, target);
  }

  isProcess(target: Type | Function): boolean {
    if (!target) {
      return false;
    }

    return !!this.reflector.get(PROCESS_METADATA, target);
  }

  getProcessorMetadata(
    target: Type | Function,
  ): MessageQueueProcessorOptions | undefined {
    return this.reflector.get(PROCESSOR_METADATA, target);
  }

  getProcessMetadata(
    target: Type | Function,
  ): MessageQueueProcessOptions | undefined {
    const metadata = this.reflector.get(PROCESS_METADATA, target);

    return metadata;
  }
}
