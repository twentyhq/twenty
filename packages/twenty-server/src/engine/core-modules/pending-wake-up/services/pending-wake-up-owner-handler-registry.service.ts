import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import {
  PendingWakeUpException,
  PendingWakeUpExceptionCode,
} from 'src/engine/core-modules/pending-wake-up/pending-wake-up.exception';
import { type PendingWakeUpOwnerHandler } from 'src/engine/core-modules/pending-wake-up/types/pending-wake-up-owner-handler.type';
import { type PendingWakeUpOwnerType } from 'src/engine/core-modules/pending-wake-up/types/pending-wake-up-owner-type.type';

// owners register here so the engine resolves their wake-ups without importing them
@Injectable()
export class PendingWakeUpOwnerHandlerRegistryService {
  private readonly handlers = new Map<
    PendingWakeUpOwnerType,
    PendingWakeUpOwnerHandler
  >();

  register(handler: PendingWakeUpOwnerHandler): void {
    this.handlers.set(handler.ownerType, handler);
  }

  getHandlerOrThrow(
    ownerType: PendingWakeUpOwnerType,
  ): PendingWakeUpOwnerHandler {
    const handler = this.handlers.get(ownerType);

    if (!isDefined(handler)) {
      throw new PendingWakeUpException(
        `No handler is registered for ${ownerType} wake-ups`,
        PendingWakeUpExceptionCode.OWNER_HANDLER_NOT_REGISTERED,
      );
    }

    return handler;
  }
}
