import { Logger } from '@nestjs/common';

import { type SendMailOptions } from 'nodemailer';

import { type EmailDriverInterface } from 'src/engine/core-modules/email/drivers/interfaces/email-driver.interface';

export class LoggerDriver implements EmailDriverInterface {
  private readonly logger = new Logger(LoggerDriver.name);

  async send(sendMailOptions: SendMailOptions): Promise<void> {
    const info =
      `Sent email to: ${sendMailOptions.to}\n` +
      `From: ${sendMailOptions.from}\n` +
      `Subject: ${sendMailOptions.subject}\n` +
      `Content Text: ${sendMailOptions.text}\n` +
      `Content HTML: ${sendMailOptions.html}`;

    this.logger.log(info);
  }
}
