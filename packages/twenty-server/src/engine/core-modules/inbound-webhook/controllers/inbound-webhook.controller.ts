import {
  Controller,
  Logger,
  Param,
  Post,
  type RawBodyRequest,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';

import { type Request, type Response } from 'express';

import {
  InboundWebhookException,
  InboundWebhookExceptionCode,
} from 'src/engine/core-modules/inbound-webhook/inbound-webhook.exception';
import { InboundWebhookDispatcherService } from 'src/engine/core-modules/inbound-webhook/services/inbound-webhook-dispatcher.service';
import { InboundWebhookIdempotencyService } from 'src/engine/core-modules/inbound-webhook/services/inbound-webhook-idempotency.service';
import { ProcessInboundWebhookJob } from 'src/engine/core-modules/inbound-webhook/jobs/process-inbound-webhook.job';
import { type InboundWebhookJobData } from 'src/engine/core-modules/inbound-webhook/dtos/inbound-webhook-job-data.type';
import { type InboundWebhookSource } from 'src/engine/core-modules/inbound-webhook/types/inbound-webhook-source.type';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';

@Controller()
export class InboundWebhookController {
  private readonly logger = new Logger(InboundWebhookController.name);

  constructor(
    private readonly dispatcher: InboundWebhookDispatcherService,
    private readonly idempotencyService: InboundWebhookIdempotencyService,
    @InjectMessageQueue(MessageQueue.inboundWebhookQueue)
    private readonly inboundWebhookQueue: MessageQueueService,
  ) {}

  @Post(['inbound-webhooks/:source'])
  @UseGuards(PublicEndpointGuard, NoPermissionGuard)
  async receive(
    @Param('source') sourceParam: string,
    @Req() request: RawBodyRequest<Request>,
    @Res() response: Response,
  ): Promise<void> {
    if (request.rawBody === undefined) {
      throw new InboundWebhookException(
        'Inbound webhook missing raw body',
        InboundWebhookExceptionCode.MISSING_RAW_BODY,
      );
    }

    const source: InboundWebhookSource = sourceParam;
    const handler = this.dispatcher.resolve(source);

    if (!(await handler.verify(request))) {
      throw new InboundWebhookException(
        `Inbound webhook signature verification failed for ${source}`,
        InboundWebhookExceptionCode.INVALID_SIGNATURE,
      );
    }

    const envelope = await handler.buildEnvelope(request);

    const claimed = await this.idempotencyService.claim({
      source,
      externalEventId: envelope.externalEventId,
    });

    if (!claimed) {
      this.logger.log(
        `Dropping duplicate inbound webhook ${source}:${envelope.externalEventId}`,
      );
      response.status(200).json({ ok: true, duplicate: true });

      return;
    }

    const jobData: InboundWebhookJobData = { envelope };

    await this.inboundWebhookQueue.add<InboundWebhookJobData>(
      ProcessInboundWebhookJob.name,
      jobData,
    );

    response.status(200).json({ ok: true });
  }
}
