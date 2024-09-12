import { Inject, Injectable } from '@nestjs/common';

import { SendMailOptions } from 'nodemailer';

import { EmailDriver } from 'src/engine/core-modules/email/drivers/interfaces/email-driver.interface';

import { EMAIL_DRIVER } from 'src/engine/core-modules/email/email.constants';

@Injectable()
export class EmailSenderService implements EmailDriver {
  constructor(@Inject(EMAIL_DRIVER) private driver: EmailDriver) {}

  async send(sendMailOptions: SendMailOptions): Promise<void> {
    await this.driver.send(sendMailOptions);
  }
}
