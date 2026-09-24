import { Logger } from '@nestjs/common';

import {
  createTransport,
  type SendMailOptions,
  type Transporter,
} from 'nodemailer';

import { type EmailDriverInterface } from 'src/engine/core-modules/email/drivers/interfaces/email-driver.interface';

import type SMTPConnection from 'nodemailer/lib/smtp-connection';

export class SmtpDriver implements EmailDriverInterface {
  private readonly logger = new Logger(SmtpDriver.name);
  private transport: Transporter;

  constructor(options: SMTPConnection.Options) {
    this.transport = createTransport({ ...options, pool: true });
  }

  close(): void {
    this.transport.close();
  }

  async send(sendMailOptions: SendMailOptions): Promise<void> {
    await this.transport.sendMail(sendMailOptions).catch((err) => {
      this.logger.error(`sending email to '${sendMailOptions.to}': ${err}`);

      throw err;
    });

    this.logger.log(`Email to '${sendMailOptions.to}' successfully sent`);
  }
}
