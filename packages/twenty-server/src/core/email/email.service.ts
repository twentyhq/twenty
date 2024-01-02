import { Injectable } from '@nestjs/common';

import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  send() {
    this.mailerService
      .sendMail({
        to: 'martmull92@gmail.com',
        from: 'martmull@hotmail.fr',
        subject: 'Test',
        text: 'Welcome',
        html: '<br>Welcome</br>',
      })
      .catch((err) => console.log(err));
  }
}
