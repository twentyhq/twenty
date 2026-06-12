import { Injectable, Logger } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { MessageSuppressionService } from 'src/engine/core-modules/emailing-domain/services/message-suppression.service';
import { MessageTopicSubscriptionService } from 'src/engine/core-modules/emailing-domain/services/message-topic-subscription.service';
import { UnsubscribeTokenService } from 'src/engine/core-modules/emailing-domain/services/unsubscribe-token.service';
import { MessageSuppressionReason } from 'src/engine/core-modules/emailing-domain/types/message-suppression-reason.type';
import { MessageSuppressionSource } from 'src/engine/core-modules/emailing-domain/types/message-suppression-source.type';
import { type SesInboundNotification } from 'src/engine/core-modules/messaging-webhooks/types/sns-message.type';

@Injectable()
export class SesInboundUnsubscribeHandlerService {
  private readonly logger = new Logger(
    SesInboundUnsubscribeHandlerService.name,
  );

  constructor(
    private readonly unsubscribeTokenService: UnsubscribeTokenService,
    private readonly messageSuppressionService: MessageSuppressionService,
    private readonly messageTopicSubscriptionService: MessageTopicSubscriptionService,
  ) {}

  async handle(notification: SesInboundNotification): Promise<void> {
    const subject = notification.mail?.commonHeaders?.subject;

    if (!isNonEmptyString(subject)) {
      this.logger.warn('Unsubscribe email received without a token subject');

      return;
    }

    const payload = this.unsubscribeTokenService.verify(subject.trim());

    if (!isDefined(payload)) {
      this.logger.warn('Unsubscribe email received with an invalid token');

      return;
    }

    // Topic-scoped when the token carries a topic (mirrors the one-click HTTP
    // controller), falling back to a global unsubscribe otherwise.
    if (isNonEmptyString(payload.messageTopicId)) {
      const unsubscribedFromTopic =
        await this.messageTopicSubscriptionService.unsubscribeByEmail({
          workspaceId: payload.workspaceId,
          emailAddress: payload.emailAddress,
          topicId: payload.messageTopicId,
        });

      if (unsubscribedFromTopic) {
        return;
      }
    }

    await this.messageSuppressionService.suppress({
      workspaceId: payload.workspaceId,
      emailAddress: payload.emailAddress,
      reason: MessageSuppressionReason.UNSUBSCRIBE,
      source: MessageSuppressionSource.SYSTEM,
    });
  }
}
