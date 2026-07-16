import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { SlackAssistantConfigService } from 'src/engine/core-modules/slack-assistant/services/slack-assistant-config.service';
import {
  SlackAssistantException,
  SlackAssistantExceptionCode,
} from 'src/engine/core-modules/slack-assistant/slack-assistant.exception';
import { verifySlackSignature } from 'src/engine/core-modules/slack-assistant/utils/slack-webhook.util';

@Injectable()
export class SlackSignatureVerifierService {
  constructor(
    private readonly slackAssistantConfigService: SlackAssistantConfigService,
  ) {}

  async verifyOrThrow({
    rawBody,
    signature,
    timestamp,
  }: {
    rawBody: string;
    signature: string | undefined;
    timestamp: string | undefined;
  }): Promise<void> {
    if (!isDefined(signature) || !isDefined(timestamp)) {
      throw new SlackAssistantException(
        'Missing Slack signature headers',
        SlackAssistantExceptionCode.INVALID_SIGNATURE,
      );
    }

    const signingSecret =
      await this.slackAssistantConfigService.getSigningSecret();

    if (!isDefined(signingSecret)) {
      throw new SlackAssistantException(
        'Slack signing secret is not configured on the twenty-slack app registration',
        SlackAssistantExceptionCode.SIGNING_SECRET_NOT_CONFIGURED,
      );
    }

    const isSignatureValid = verifySlackSignature({
      body: rawBody,
      signature,
      timestamp,
      signingSecret,
    });

    if (!isSignatureValid) {
      throw new SlackAssistantException(
        'Slack request signature verification failed',
        SlackAssistantExceptionCode.INVALID_SIGNATURE,
      );
    }
  }
}
