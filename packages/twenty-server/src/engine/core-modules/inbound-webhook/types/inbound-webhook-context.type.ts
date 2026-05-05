import { type RawBodyRequest } from '@nestjs/common';

import { type Request } from 'express';

import { type InboundWebhookSource } from 'src/engine/core-modules/inbound-webhook/types/inbound-webhook-source.type';

export type InboundWebhookRequest = RawBodyRequest<Request>;

export type InboundWebhookEnvelope = {
  source: InboundWebhookSource;
  externalEventId: string;
  workspaceId: string | null;
  subscriptionId: string | null;
  payload: unknown;
  headers: Record<string, string | string[] | undefined>;
};
