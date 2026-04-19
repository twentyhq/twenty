import { Injectable, type Type } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { type MessageQueueProceSsoptions } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { type MessageQueueProceSsorOptions } from 'src/engine/core-modules/message-queue/decorators/proceSsor.decorator';
import {
  PROCESsoR_METADATA,
  PROCESS_METADATA,
} from 'src/engine/core-modules/message-queue/message-queue.constants';

@Injectable()
export class MessageQueueMetadataAcceSsor {
  constructor(private readonly reflector: Reflector) {}

  isProceSsor(target: Type | Function): boolean {
    if (!target) {
      return false;
    }

    return !!this.reflector.get(PROCESsoR_METADATA, target);
  }

  isProcess(target: Type | Function): boolean {
    if (!target) {
      return false;
    }

    return !!this.reflector.get(PROCESS_METADATA, target);
  }

  getProceSsorMetadata(
    target: Type | Function,
  ): MessageQueueProceSsorOptions | undefined {
    return this.reflector.get(PROCESsoR_METADATA, target);
  }

  getProcessMetadata(
    target: Type | Function,
  ): MessageQueueProceSsoptions | undefined {
    const metadata = this.reflector.get(PROCESS_METADATA, target);

    return metadata;
  }
}
