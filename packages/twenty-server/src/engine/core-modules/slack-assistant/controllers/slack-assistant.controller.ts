import {
  Controller,
  Headers,
  HttpCode,
  Logger,
  Post,
  type RawBodyRequest,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import {
  SLACK_ASSISTANT_REPLY_JOB_NAME,
  SLACK_EVENTS_WEBHOOK_ROUTE,
} from 'src/engine/core-modules/slack-assistant/constants/slack-assistant.constants';
import { SlackSignatureVerifierService } from 'src/engine/core-modules/slack-assistant/services/slack-signature-verifier.service';
import {
  SlackAssistantException,
  SlackAssistantExceptionCode,
} from 'src/engine/core-modules/slack-assistant/slack-assistant.exception';
import { type SlackAssistantReplyJobData } from 'src/engine/core-modules/slack-assistant/types/slack-assistant-reply-job.type';
import { parseSlackWebhookBody } from 'src/engine/core-modules/slack-assistant/utils/slack-webhook.util';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';

@Controller()
export class SlackAssistantController {
  private readonly logger = new Logger(SlackAssistantController.name);

  constructor(
    private readonly slackSignatureVerifierService: SlackSignatureVerifierService,
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

    try {
      await this.slackSignatureVerifierService.verifyOrThrow({
        rawBody,
        signature,
        timestamp,
      });
    } catch {
      throw new UnauthorizedException('Invalid Slack signature');
    }

    const payload = parseSlackWebhookBody(rawBody);

    if (payload.kind === 'url_verification') {
      return { challenge: payload.challenge };
    }

    if (
      payload.kind === 'direct_message' &&
      (isDefined(payload.botId) || isNonEmptyString(payload.subtype))
    ) {
      return { ok: true };
    }

    if (payload.kind === 'app_mention' || payload.kind === 'direct_message') {
      if (!isDefined(payload.teamId) || !isNonEmptyString(payload.text)) {
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
          slackUserId: payload.userId,
          eventId: payload.eventId,
        },
      );
    }

    return { ok: true };
  }
}
