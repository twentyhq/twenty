import {
  BadRequestException,
  Controller,
  Get,
  Header,
  HttpCode,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';

import { MessageSuppressionService } from 'src/engine/core-modules/emailing-domain/services/message-suppression.service';
import { MessageSubscriptionService } from 'src/engine/core-modules/emailing-domain/services/message-subscription.service';
import { UnsubscribeTokenService } from 'src/engine/core-modules/emailing-domain/services/unsubscribe-token.service';
import { MessageSuppressionReason } from 'src/engine/core-modules/emailing-domain/types/message-suppression-reason.type';
import { MessageSuppressionSource } from 'src/engine/core-modules/emailing-domain/types/message-suppression-source.type';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';

const UNSUBSCRIBE_TOKEN_FORMAT = /^[A-Za-z0-9_-]{1,512}\.[A-Za-z0-9_-]{1,86}$/;

@Controller('emailing/unsubscribe')
@UseGuards(PublicEndpointGuard, NoPermissionGuard)
export class UnsubscribeController {
  constructor(
    private readonly unsubscribeTokenService: UnsubscribeTokenService,
    private readonly messageSuppressionService: MessageSuppressionService,
    private readonly messageSubscriptionService: MessageSubscriptionService,
  ) {}

  @Post()
  @HttpCode(200)
  async handleOneClickUnsubscribe(@Query('t') token: string): Promise<void> {
    await this.unsubscribe(token);
  }

  @Get()
  @Header('Content-Type', 'text/html; charset=utf-8')
  async handleBrowserUnsubscribe(@Query('t') token: string): Promise<string> {
    await this.unsubscribe(token);

    const html = /* html */ `<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"><title>Unsubscribed</title></head><body style="font-family:sans-serif;text-align:center;padding:48px"><h1>You have been unsubscribed</h1><p>You will no longer receive marketing emails from this sender.</p></body></html>`;
    return html;
  }

  private async unsubscribe(token: string): Promise<void> {
    if (!isNonEmptyString(token) || !UNSUBSCRIBE_TOKEN_FORMAT.test(token)) {
      throw new BadRequestException('Malformed unsubscribe token');
    }

    const payload = this.unsubscribeTokenService.verify(token);

    if (payload === null) {
      throw new BadRequestException('Invalid unsubscribe token');
    }

    if (isNonEmptyString(payload.messageTopicId)) {
      const unsubscribedFromList =
        await this.messageSubscriptionService.unsubscribeByEmail({
          workspaceId: payload.workspaceId,
          emailAddress: payload.emailAddress,
          listId: payload.messageTopicId,
        });

      if (unsubscribedFromList) {
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
