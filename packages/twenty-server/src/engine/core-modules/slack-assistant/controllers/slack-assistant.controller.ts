import {
  Controller,
  Headers,
  HttpCode,
  Post,
  type RawBodyRequest,
  Req,
  UseFilters,
  UseGuards,
} from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { SlackAssistantApiExceptionFilter } from 'src/engine/core-modules/slack-assistant/filters/slack-assistant-api-exception.filter';
import {
  SLACK_ASSISTANT_REPLY_JOB_NAME,
  SLACK_EVENTS_WEBHOOK_ROUTE,
} from 'src/engine/core-modules/slack-assistant/constants/slack-assistant.constants';
import { SlackSignatureVerifierService } from 'src/engine/core-modules/slack-assistant/services/slack-signature-verifier.service';
import { SlackThreadSubscriptionService } from 'src/engine/core-modules/slack-assistant/services/slack-thread-subscription.service';
import {
  SlackAssistantException,
  SlackAssistantExceptionCode,
} from 'src/engine/core-modules/slack-assistant/slack-assistant.exception';
import { type SlackAssistantReplyJobData } from 'src/engine/core-modules/slack-assistant/types/slack-assistant-reply-job.type';
import { parseSlackWebhookBody } from 'src/engine/core-modules/slack-assistant/utils/parse-slack-webhook-body.util';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';

@Controller()
@UseFilters(SlackAssistantApiExceptionFilter)
export class SlackAssistantController {
  constructor(
    private readonly slackSignatureVerifierService: SlackSignatureVerifierService,
    private readonly slackThreadSubscriptionService: SlackThreadSubscriptionService,
    @InjectMessageQueue(MessageQueue.aiQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  @Post([SLACK_EVENTS_WEBHOOK_ROUTE])
  @HttpCode(200)
  @UseGuards(PublicEndpointGuard, NoPermissionGuard)
  async handleSlackEvents(
    @Req() request: RawBodyRequest<Request>,
    @Headers('x-slack-signature') signature: string | undefined,
    @Headers('x-slack-request-timestamp') timestamp: string | undefined,
  ): Promise<{ challenge: string } | { ok: true }> {
    const rawBody = request.rawBody?.toString('utf-8');

    if (!isNonEmptyString(rawBody)) {
      throw new SlackAssistantException(
        'Missing Slack request body',
        SlackAssistantExceptionCode.MISSING_REQUEST_BODY,
      );
    }

    await this.slackSignatureVerifierService.verifyOrThrow({
      rawBody,
      signature,
      timestamp,
    });

    const payload = parseSlackWebhookBody(rawBody);

    if (payload.kind === 'url_verification') {
      return { challenge: payload.challenge };
    }

    if (payload.kind === 'unsupported') {
      return { ok: true };
    }

    if (
      (payload.kind === 'direct_message' ||
        payload.kind === 'channel_message') &&
      (isDefined(payload.botId) || isNonEmptyString(payload.subtype))
    ) {
      return { ok: true };
    }

    if (!isDefined(payload.teamId) || !isNonEmptyString(payload.text)) {
      return { ok: true };
    }

    if (
      payload.kind === 'channel_message' &&
      !(await this.slackThreadSubscriptionService.isSubscribed({
        teamId: payload.teamId,
        channelId: payload.channelId,
        threadTs: payload.threadTs,
      }))
    ) {
      return { ok: true };
    }

    await this.messageQueueService.add<SlackAssistantReplyJobData>(
      SLACK_ASSISTANT_REPLY_JOB_NAME,
      {
        teamId: payload.teamId,
        enterpriseId: payload.enterpriseId,
        channelId: payload.channelId,
        threadTs: payload.threadTs,
        text: payload.text,
        ts: payload.ts,
      },
    );

    return { ok: true };
  }
}
