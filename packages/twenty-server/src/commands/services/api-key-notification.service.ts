import { Injectable, Logger } from '@nestjs/common';

import { render } from '@react-email/render';
import { ApiKeyCreatedEmail } from 'twenty-emails';
import { APP_LOCALES } from 'twenty-shared/translations';

import { EmailService } from 'src/engine/core-modules/email/email.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

interface ApiKeyNotificationData {
  apiKeyToken: string;
  apiKeyName: string;
  workspaceName: string;
  adminEmail: string;
  adminPassword: string;
  domainName?: string;
  publicIp?: string;
  isGmailEnabled?: boolean;
  isGoogleCalendarEnabled?: boolean;
}

@Injectable()
export class ApiKeyNotificationService {
  private readonly logger = new Logger(ApiKeyNotificationService.name);

  constructor(
    private readonly emailService: EmailService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  async sendApiKeyCreatedNotification(
    data: ApiKeyNotificationData,
  ): Promise<void> {
    try {
      const serverUrl =
        this.twentyConfigService.get('SERVER_URL') || 'http://localhost:3000';
      const locale: keyof typeof APP_LOCALES = 'en'; // Default to English

      const emailData = {
        apiKeyToken: data.apiKeyToken,
        apiKeyName: data.apiKeyName,
        workspaceName: data.workspaceName,
        serverUrl,
        adminEmail: data.adminEmail,
        adminPassword: data.adminPassword,
        domainName: data.domainName,
        publicIp: data.publicIp,
        isGmailEnabled: data.isGmailEnabled,
        isGoogleCalendarEnabled: data.isGoogleCalendarEnabled,
        locale,
      };

      const emailTemplate = ApiKeyCreatedEmail(emailData);
      const html = await render(emailTemplate);
      const text = await render(emailTemplate, {
        plainText: true,
      });

      await this.emailService.send({
        from: `${this.twentyConfigService.get(
          'EMAIL_FROM_NAME',
        )} <${this.twentyConfigService.get('EMAIL_FROM_ADDRESS')}>`,
        to: data.adminEmail,
        subject: 'Your AI-Powered Workspace is ready',
        text,
        html,
      });

      this.logger.log(
        `API key notification email sent successfully to ${data.adminEmail}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send API key notification email: ${error.message}`,
      );
      throw error;
    }
  }
}
