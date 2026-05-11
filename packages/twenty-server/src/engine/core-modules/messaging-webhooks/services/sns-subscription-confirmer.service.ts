import { Injectable, Logger } from '@nestjs/common';

const SNS_SUBSCRIBE_URL_PATTERN =
  /^https:\/\/sns\.[a-z0-9-]+\.amazonaws\.com\//;

@Injectable()
export class SnsSubscriptionConfirmerService {
  private readonly logger = new Logger(SnsSubscriptionConfirmerService.name);

  async confirm(subscribeUrl: string | undefined): Promise<void> {
    if (!subscribeUrl) {
      return;
    }

    if (!SNS_SUBSCRIBE_URL_PATTERN.test(subscribeUrl)) {
      this.logger.error(
        `Refusing to fetch non-AWS SubscribeURL: ${subscribeUrl}`,
      );

      return;
    }

    const response = await fetch(subscribeUrl);

    if (!response.ok) {
      this.logger.error(
        `Failed to confirm SNS subscription via ${subscribeUrl}: ${response.status}`,
      );

      return;
    }

    this.logger.log(`Confirmed SNS subscription via ${subscribeUrl}`);
  }
}
