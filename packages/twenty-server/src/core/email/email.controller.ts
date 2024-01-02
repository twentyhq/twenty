import { Controller, Get } from '@nestjs/common';

import { EmailService } from 'src/core/email/email.service';

@Controller('test')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Get('email')
  mail() {
    this.emailService.send();
  }
}
