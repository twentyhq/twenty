import { Logger } from '@nestjs/common';

import { createTransport, SendMailOptions, Transporter } from 'nodemailer';
import SMTPConnection from 'nodemailer/lib/smtp-connection';

import { EmailDriverInterface } from 'src/engine/core-modules/email/drivers/interfaces/email-driver.interface';

export class SmtpDriver implements EmailDriverInterface {
  private readonly logger = new Logger(SmtpDriver.name);
  private transport: Transporter;

  constructor(options: SMTPConnection.Options) {
    this.transport = createTransport(options);
  }

  async send(sendMailOptions: SendMailOptions): Promise<void> {
    this.transport
      .sendMail(sendMailOptions)
      .then(() =>
        this.logger.log(`Email to '${sendMailOptions.to}' successfully sent`),
      )
      .catch((err) =>
        this.logger.error(`sending email to '${sendMailOptions.to}': ${err}`),
      );
  }
}
