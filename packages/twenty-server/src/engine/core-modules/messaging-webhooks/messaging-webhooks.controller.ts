import {
  BadRequestException,
  Controller,
  HttpCode,
  Post,
  type RawBodyRequest,
  Req,
  UseGuards,
} from '@nestjs/common';

import { type Request } from 'express';

import { SesInboundWebhookRouterService } from 'src/engine/core-modules/messaging-webhooks/services/ses-inbound-webhook-router.service';
import { SesOutboundWebhookRouterService } from 'src/engine/core-modules/messaging-webhooks/services/ses-outbound-webhook-router.service';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';
import { isDefined } from 'twenty-shared/utils';

@Controller()
export class MessagingWebhooksController {
  constructor(
    private readonly sesInboundWebhookRouterService: SesInboundWebhookRouterService,
    private readonly sesOutboundWebhookRouterService: SesOutboundWebhookRouterService,
  ) {}

  @Post(['webhooks/messaging/ses/inbound'])
  @UseGuards(PublicEndpointGuard, NoPermissionGuard)
  @HttpCode(200)
  async handleSesInboundWebhook(
    @Req() request: RawBodyRequest<Request>,
  ): Promise<void> {
    if (!isDefined(request.rawBody)) {
      throw new BadRequestException('Missing SNS payload');
    }

    await this.sesInboundWebhookRouterService.route(request.rawBody);
  }

  @Post(['webhooks/messaging/ses/outbound'])
  @UseGuards(PublicEndpointGuard, NoPermissionGuard)
  @HttpCode(200)
  async handleSesOutboundWebhook(
    @Req() request: RawBodyRequest<Request>,
  ): Promise<void> {
    if (!isDefined(request.rawBody)) {
      throw new BadRequestException('Missing SNS payload');
    }

    await this.sesOutboundWebhookRouterService.route(request.rawBody);
  }
}
