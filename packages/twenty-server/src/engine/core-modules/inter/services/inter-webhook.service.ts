import { Injectable, Logger } from '@nestjs/common';

import { InterInstanceService } from 'src/engine/core-modules/inter/services/inter-instance.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

@Injectable()
export class InterWebhookService {
  protected readonly logger = new Logger(InterWebhookService.name);

  constructor(
    private readonly interInstanceService: InterInstanceService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  async registerWebhook(): Promise<boolean> {
    const accessToken = await this.interInstanceService.getOauthToken();

    const WEBHOOK_URL = `${this.twentyConfigService.get('WEBHOOK_URL')}/webhooks/inter`;

    const requestBody = {
      webhook_url: WEBHOOK_URL,
    };

    // TODO: Validate which data is passed in content-length and host
    try {
      const response = await this.interInstanceService
        .getInterAxiosInstance()
        .put('/cobranca/v3/cobrancas/webhook', requestBody, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'Content-Length': '',
            Host: '',
            'x-conta-corrente': '123',
          },
        });

      if (response.status === 200 || response.status === 201) {
        this.logger.log('Webhook successfully registered');

        return true;
      } else {
        this.logger.error('Webhook registration failed');

        return false;
      }
    } catch (error) {
      this.logger.error('Error registering the webhook: ', error.stack);

      return false;
    }
  }
}
