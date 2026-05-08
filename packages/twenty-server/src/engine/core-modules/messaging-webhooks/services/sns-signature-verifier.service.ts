import { ForbiddenException, Injectable, Logger } from '@nestjs/common';

import SnsPayloadValidator from 'sns-payload-validator';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

type SnsPayload = SnsPayloadValidator.SnsPayload;

@Injectable()
export class SnsSignatureVerifierService {
  private readonly logger = new Logger(SnsSignatureVerifierService.name);
  private readonly validator = new SnsPayloadValidator();

  constructor(private readonly twentyConfigService: TwentyConfigService) {}

  async assertAllowedAndSigned(payload: SnsPayload): Promise<void> {
    if (!this.isTopicAllowlisted(payload.TopicArn)) {
      this.logger.warn(`SNS topic ${payload.TopicArn} is not in allowlist`);

      throw new ForbiddenException('SNS topic not allowed');
    }

    try {
      await this.validator.validate(payload);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      this.logger.warn(`SNS signature verification failed: ${errorMessage}`);

      throw new ForbiddenException('SNS signature invalid');
    }
  }

  private isTopicAllowlisted(topicArn: string): boolean {
    const allowlist = this.twentyConfigService.get(
      'SES_SNS_TOPIC_ARN_ALLOWLIST',
    );

    if (typeof allowlist !== 'string' || allowlist.trim() === '') {
      return false;
    }

    return allowlist
      .split(',')
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0)
      .includes(topicArn);
  }
}
