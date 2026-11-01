import { Injectable } from '@nestjs/common';

import { type PendingWakeUpOwnerHandler } from 'src/engine/core-modules/pending-wake-up/types/pending-wake-up-owner-handler.type';
import { HandlerRegistry } from 'src/engine/utils/handler-registry';

@Injectable()
export class PendingWakeUpOwnerHandlerRegistryService extends HandlerRegistry<PendingWakeUpOwnerHandler> {}
