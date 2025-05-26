import { Injectable } from '@nestjs/common';

import { SendMailOptions } from 'nodemailer';

import { EmailDriver } from 'src/engine/core-modules/email/drivers/interfaces/email-driver.interface';
import { EmailDriver as EmailDriverEnum } from 'src/engine/core-modules/email/interfaces/email.interface';

import { LoggerDriver } from 'src/engine/core-modules/email/drivers/logger.driver';
import { SmtpDriver } from 'src/engine/core-modules/email/drivers/smtp.driver';
import { DynamicDriverBase } from 'src/engine/core-modules/twenty-config/dynamic-driver.base';
import { ConfigVariablesGroup } from 'src/engine/core-modules/twenty-config/enums/config-variables-group.enum';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

@Injectable()
export class EmailSenderService
  extends DynamicDriverBase<EmailDriver>
  implements EmailDriver
{
  constructor(twentyConfigService: TwentyConfigService) {
    super(twentyConfigService);
  }

  protected buildConfigKey(): string {
    const driver = this.twentyConfigService.get('EMAIL_DRIVER');

    if (driver === EmailDriverEnum.Logger) {
      return 'logger';
    }

    if (driver === EmailDriverEnum.Smtp) {
      // Hash all EmailSettings config variables for robust cache invalidation
      const emailConfigHash = this.getConfigGroupHash(
        ConfigVariablesGroup.EmailSettings,
      );

      return `smtp|${emailConfigHash}`;
    }

    throw new Error(`Unsupported email driver: ${driver}`);
  }

  protected createDriver(): EmailDriver {
    const driver = this.twentyConfigService.get('EMAIL_DRIVER');

    switch (driver) {
      case EmailDriverEnum.Logger:
        return new LoggerDriver();

      case EmailDriverEnum.Smtp: {
        const host = this.twentyConfigService.get('EMAIL_SMTP_HOST');
        const port = this.twentyConfigService.get('EMAIL_SMTP_PORT');
        const user = this.twentyConfigService.get('EMAIL_SMTP_USER');
        const pass = this.twentyConfigService.get('EMAIL_SMTP_PASSWORD');
        const noTLS = this.twentyConfigService.get('EMAIL_SMTP_NO_TLS');

        if (!host || !port) {
          throw new Error('SMTP driver requires host and port to be defined');
        }

        const options: {
          host: string;
          port: number;
          auth?: { user: string; pass: string };
          secure?: boolean;
          ignoreTLS?: boolean;
          requireTLS?: boolean;
        } = { host, port };

        if (user && pass) {
          options.auth = { user, pass };
        }

        if (noTLS) {
          options.secure = false;
          options.ignoreTLS = true;
        } else {
          // For most SMTP servers (Gmail, etc.) on port 587
          if (port === 587) {
            options.secure = false; // Use STARTTLS instead of direct TLS
            options.requireTLS = true; // Require STARTTLS
          } else if (port === 465) {
            options.secure = true; // Direct TLS connection
          }
        }

        return new SmtpDriver(options);
      }

      default:
        throw new Error(`Invalid email driver: ${driver}`);
    }
  }

  async send(sendMailOptions: SendMailOptions): Promise<void> {
    await this.getCurrentDriver().send(sendMailOptions);
  }
}
