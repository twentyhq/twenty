import { Injectable } from '@nestjs/common';

import { GoogleCalendarInboundWebhookHandler } from 'src/engine/core-modules/inbound-webhook/handlers/google-calendar-inbound-webhook.handler';
import { GoogleMessagingInboundWebhookHandler } from 'src/engine/core-modules/inbound-webhook/handlers/google-messaging-inbound-webhook.handler';
import { InboundEmailSesInboundWebhookHandler } from 'src/engine/core-modules/inbound-webhook/handlers/inbound-email-ses-inbound-webhook.handler';
import { MicrosoftCalendarInboundWebhookHandler } from 'src/engine/core-modules/inbound-webhook/handlers/microsoft-calendar-inbound-webhook.handler';
import { MicrosoftMessagingInboundWebhookHandler } from 'src/engine/core-modules/inbound-webhook/handlers/microsoft-messaging-inbound-webhook.handler';
import {
  InboundWebhookException,
  InboundWebhookExceptionCode,
} from 'src/engine/core-modules/inbound-webhook/inbound-webhook.exception';
import {
  type InboundWebhookHandler,
  type SubscribableInboundWebhookHandler,
  isSubscribableInboundWebhookHandler,
} from 'src/engine/core-modules/inbound-webhook/types/inbound-webhook-handler.type';
import { type InboundWebhookSource } from 'src/engine/core-modules/inbound-webhook/types/inbound-webhook-source.type';

@Injectable()
export class InboundWebhookDispatcherService {
  constructor(
    private readonly googleMessagingHandler: GoogleMessagingInboundWebhookHandler,
    private readonly googleCalendarHandler: GoogleCalendarInboundWebhookHandler,
    private readonly microsoftMessagingHandler: MicrosoftMessagingInboundWebhookHandler,
    private readonly microsoftCalendarHandler: MicrosoftCalendarInboundWebhookHandler,
    private readonly inboundEmailSesHandler: InboundEmailSesInboundWebhookHandler,
  ) {}

  resolve(source: InboundWebhookSource): InboundWebhookHandler {
    switch (source) {
      case 'google-messaging':
        return this.googleMessagingHandler;
      case 'google-calendar':
        return this.googleCalendarHandler;
      case 'microsoft-messaging':
        return this.microsoftMessagingHandler;
      case 'microsoft-calendar':
        return this.microsoftCalendarHandler;
      case 'inbound-email-ses':
        return this.inboundEmailSesHandler;
      default: {
        const _exhaustive: never = source;

        throw new InboundWebhookException(
          `Inbound webhook source ${_exhaustive} is not supported`,
          InboundWebhookExceptionCode.SOURCE_NOT_SUPPORTED,
        );
      }
    }
  }

  resolveSubscribable(
    source: InboundWebhookSource,
  ): SubscribableInboundWebhookHandler | null {
    const handler = this.resolve(source);

    return isSubscribableInboundWebhookHandler(handler) ? handler : null;
  }
}
