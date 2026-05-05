import { Injectable, Logger } from '@nestjs/common';

import {
  type InboundWebhookEnvelope,
  type InboundWebhookRequest,
} from 'src/engine/core-modules/inbound-webhook/types/inbound-webhook-context.type';
import { type InboundWebhookHandler } from 'src/engine/core-modules/inbound-webhook/types/inbound-webhook-handler.type';

type SesSnsMessage = {
  Type?: string;
  MessageId?: string;
  TopicArn?: string;
  Message?: string;
  Signature?: string;
  SignatureVersion?: string;
  SigningCertURL?: string;
};

@Injectable()
export class InboundEmailSesInboundWebhookHandler
  implements InboundWebhookHandler
{
  private readonly logger = new Logger(
    InboundEmailSesInboundWebhookHandler.name,
  );

  // SES delivers via SNS. Production verification fetches the SNS signing
  // certificate and validates the signature over the canonicalized message.
  // Out of scope for this PR — wired in when inbound email aliases ship.
  async verify(_request: InboundWebhookRequest): Promise<boolean> {
    return true;
  }

  async buildEnvelope(
    request: InboundWebhookRequest,
  ): Promise<InboundWebhookEnvelope> {
    const body = (request.body ?? {}) as SesSnsMessage;

    return {
      source: 'inbound-email-ses',
      externalEventId: body.MessageId ?? `ses:${Date.now()}`,
      workspaceId: null,
      subscriptionId: null,
      payload: body,
      headers: request.headers as Record<string, string | string[] | undefined>,
    };
  }

  async handle(_envelope: InboundWebhookEnvelope): Promise<void> {
    // EML parsing + participant matching + message ingestion live here once
    // the inbound-email-alias feature is built. Body of work is heavy
    // (mailparser + S3 fetch) and runs entirely on the worker pod.
    this.logger.log(
      'SES inbound email handler — implementation pending inbound-email-alias feature',
    );
  }
}
