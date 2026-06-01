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

import { EmailGroupSuppressionService } from 'src/engine/core-modules/emailing-domain/services/email-group-suppression.service';
import { EmailListSubscriptionService } from 'src/engine/core-modules/emailing-domain/services/email-list-subscription.service';
import { UnsubscribeTokenService } from 'src/engine/core-modules/emailing-domain/services/unsubscribe-token.service';
import { EmailGroupSuppressionReason } from 'src/engine/core-modules/emailing-domain/types/email-group-suppression-reason.type';
import { EmailGroupSuppressionSource } from 'src/engine/core-modules/emailing-domain/types/email-group-suppression-source.type';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';

const UNSUBSCRIBE_TOKEN_FORMAT = /^[A-Za-z0-9_-]{1,512}\.[A-Za-z0-9_-]{1,86}$/;

@Controller('emailing/unsubscribe')
@UseGuards(PublicEndpointGuard, NoPermissionGuard)
export class UnsubscribeController {
  constructor(
    private readonly unsubscribeTokenService: UnsubscribeTokenService,
    private readonly emailGroupSuppressionService: EmailGroupSuppressionService,
    private readonly emailListSubscriptionService: EmailListSubscriptionService,
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

    if (isNonEmptyString(payload.emailListId)) {
      const unsubscribedFromList =
        await this.emailListSubscriptionService.unsubscribeByEmail({
          workspaceId: payload.workspaceId,
          emailAddress: payload.emailAddress,
          listId: payload.emailListId,
        });

      if (unsubscribedFromList) {
        return;
      }
    }

    await this.emailGroupSuppressionService.suppress({
      workspaceId: payload.workspaceId,
      emailAddress: payload.emailAddress,
      reason: EmailGroupSuppressionReason.UNSUBSCRIBE,
      source: EmailGroupSuppressionSource.SYSTEM,
    });
  }
}
