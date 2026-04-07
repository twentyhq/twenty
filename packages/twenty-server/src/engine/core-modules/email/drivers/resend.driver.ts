import { Logger } from '@nestjs/common';

import { type SendMailOptions } from 'nodemailer';

import { type EmailDriverInterface } from 'src/engine/core-modules/email/drivers/interfaces/email-driver.interface';

export class ResendDriver implements EmailDriverInterface {
  private readonly logger = new Logger(ResendDriver.name);
  private readonly apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async send(sendMailOptions: SendMailOptions): Promise<void> {
    const to = Array.isArray(sendMailOptions.to)
      ? sendMailOptions.to.map((addr) =>
          typeof addr === 'string' ? addr : addr.address ?? '',
        )
      : typeof sendMailOptions.to === 'string'
        ? [sendMailOptions.to]
        : sendMailOptions.to?.address
          ? [sendMailOptions.to.address]
          : [];

    const from =
      typeof sendMailOptions.from === 'string'
        ? sendMailOptions.from
        : !Array.isArray(sendMailOptions.from)
          ? (sendMailOptions.from?.address ?? '')
          : '';

    fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to,
        subject: sendMailOptions.subject ?? '',
        html:
          typeof sendMailOptions.html === 'string'
            ? sendMailOptions.html
            : undefined,
        text:
          typeof sendMailOptions.text === 'string'
            ? sendMailOptions.text
            : undefined,
      }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.text();

          throw new Error(`HTTP ${res.status}: ${body}`);
        }
        this.logger.log(`Email to '${sendMailOptions.to}' successfully sent`);
      })
      .catch((err) =>
        this.logger.error(`sending email to '${sendMailOptions.to}': ${err}`),
      );
  }
}
