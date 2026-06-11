import {
  BadRequestException,
  Body,
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
import { MessageTopicSubscriptionService } from 'src/engine/core-modules/emailing-domain/services/message-topic-subscription.service';
import {
  type UnsubscribeTokenPayload,
  UnsubscribeTokenService,
} from 'src/engine/core-modules/emailing-domain/services/unsubscribe-token.service';
import { MessageSuppressionReason } from 'src/engine/core-modules/emailing-domain/types/message-suppression-reason.type';
import { MessageSuppressionSource } from 'src/engine/core-modules/emailing-domain/types/message-suppression-source.type';
import { buildUnsubscribePreferencesPage } from 'src/engine/core-modules/emailing-domain/utils/build-unsubscribe-preferences-page.util';
import { buildUnsubscribeResultPage } from 'src/engine/core-modules/emailing-domain/utils/build-unsubscribe-result-page.util';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';

const UNSUBSCRIBE_TOKEN_FORMAT = /^[A-Za-z0-9_-]{1,1024}$/;

const UPDATE_PREFERENCES_PATH = '/emailing/unsubscribe/preferences';
const UNSUBSCRIBE_ALL_PATH = '/emailing/unsubscribe/all';

const HTML_CONTENT_TYPE = 'text/html; charset=utf-8';

type UnsubscribeFormBody = {
  t?: string;
  topicId?: string | string[];
};

@Controller('emailing/unsubscribe')
@UseGuards(PublicEndpointGuard, NoPermissionGuard)
export class UnsubscribeController {
  constructor(
    private readonly unsubscribeTokenService: UnsubscribeTokenService,
    private readonly messageSuppressionService: MessageSuppressionService,
    private readonly messageTopicSubscriptionService: MessageTopicSubscriptionService,
  ) {}

  // RFC 8058 one-click: mail clients POST here with no user interaction, so it
  // must unsubscribe immediately rather than render the preference page.
  @Post()
  @HttpCode(200)
  async handleOneClickUnsubscribe(@Query('t') token: string): Promise<void> {
    const payload = this.verifyTokenOrThrow(token);

    await this.applyTokenUnsubscribe(payload);
  }

  @Get()
  @Header('Content-Type', HTML_CONTENT_TYPE)
  async handlePreferencesPage(@Query('t') token: string): Promise<string> {
    const payload = this.verifyTokenOrThrow(token);

    const topics =
      await this.messageTopicSubscriptionService.getSubscribedTopics({
        workspaceId: payload.workspaceId,
        emailAddress: payload.emailAddress,
      });

    return buildUnsubscribePreferencesPage({
      token,
      topics,
      updatePath: UPDATE_PREFERENCES_PATH,
      unsubscribeAllPath: UNSUBSCRIBE_ALL_PATH,
    });
  }

  @Post('preferences')
  @Header('Content-Type', HTML_CONTENT_TYPE)
  async handleUpdatePreferences(
    @Body() body: UnsubscribeFormBody,
  ): Promise<string> {
    const payload = this.verifyTokenOrThrow(body.t);

    await this.messageTopicSubscriptionService.setSubscribedTopics({
      workspaceId: payload.workspaceId,
      emailAddress: payload.emailAddress,
      subscribedTopicIds: this.normalizeTopicIds(body.topicId),
    });

    return buildUnsubscribeResultPage(
      'Preferences updated',
      'Your email preferences have been saved.',
    );
  }

  @Post('all')
  @Header('Content-Type', HTML_CONTENT_TYPE)
  async handleUnsubscribeAll(
    @Body() body: UnsubscribeFormBody,
  ): Promise<string> {
    const payload = this.verifyTokenOrThrow(body.t);

    await this.suppressAll(payload);

    return buildUnsubscribeResultPage(
      'You have been unsubscribed',
      'You will no longer receive marketing emails from this sender.',
    );
  }

  private normalizeTopicIds(topicId: string | string[] | undefined): string[] {
    if (Array.isArray(topicId)) {
      return topicId.filter(isNonEmptyString);
    }

    return isNonEmptyString(topicId) ? [topicId] : [];
  }

  private verifyTokenOrThrow(
    token: string | undefined,
  ): UnsubscribeTokenPayload {
    if (!isNonEmptyString(token) || !UNSUBSCRIBE_TOKEN_FORMAT.test(token)) {
      throw new BadRequestException('Malformed unsubscribe token');
    }

    const payload = this.unsubscribeTokenService.verify(token);

    if (payload === null) {
      throw new BadRequestException('Invalid unsubscribe token');
    }

    return payload;
  }

  private async applyTokenUnsubscribe(
    payload: UnsubscribeTokenPayload,
  ): Promise<void> {
    if (isNonEmptyString(payload.messageTopicId)) {
      const unsubscribedFromList =
        await this.messageTopicSubscriptionService.unsubscribeByEmail({
          workspaceId: payload.workspaceId,
          emailAddress: payload.emailAddress,
          topicId: payload.messageTopicId,
        });

      if (unsubscribedFromList) {
        return;
      }
    }

    await this.suppressAll(payload);
  }

  private async suppressAll(payload: UnsubscribeTokenPayload): Promise<void> {
    await this.messageSuppressionService.suppress({
      workspaceId: payload.workspaceId,
      emailAddress: payload.emailAddress,
      reason: MessageSuppressionReason.UNSUBSCRIBE,
      source: MessageSuppressionSource.SYSTEM,
    });
  }
}
