import {
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { FieldActorSource } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { EmailGroupSuppressionService } from 'src/engine/core-modules/emailing-domain/services/email-group-suppression.service';
import { EmailGroupUnsubscribeService } from 'src/engine/core-modules/emailing-domain/services/email-group-unsubscribe.service';
import { EmailGroupSuppressionReason } from 'src/engine/core-modules/emailing-domain/types/email-group-suppression-reason.type';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';

@Controller('emailing')
export class EmailingDomainUnsubscribeController {
  constructor(
    private readonly emailGroupUnsubscribeService: EmailGroupUnsubscribeService,
    private readonly emailGroupSuppressionService: EmailGroupSuppressionService,
  ) {}

  @Post('unsubscribe')
  @UseGuards(PublicEndpointGuard, NoPermissionGuard)
  @HttpCode(200)
  async unsubscribeOneClick(@Query('token') token?: string): Promise<void> {
    await this.unsubscribe(token);
  }

  @Get('unsubscribe')
  @UseGuards(PublicEndpointGuard, NoPermissionGuard)
  @HttpCode(200)
  async unsubscribeFromBrowser(
    @Query('token') token?: string,
  ): Promise<string> {
    await this.unsubscribe(token);

    return 'You have been unsubscribed.';
  }

  private async unsubscribe(token?: string): Promise<void> {
    if (!isNonEmptyString(token)) {
      return;
    }

    const payload = this.emailGroupUnsubscribeService.verifyToken(token);

    if (!isDefined(payload)) {
      return;
    }

    await this.emailGroupSuppressionService.suppress(
      payload.workspaceId,
      payload.emailAddress,
      EmailGroupSuppressionReason.UNSUBSCRIBE,
      FieldActorSource.API,
    );
  }
}
