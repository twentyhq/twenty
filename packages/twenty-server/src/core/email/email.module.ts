import { Module } from '@nestjs/common';

import { EmailController } from 'src/core/email/email.controller';
import { EmailService } from 'src/core/email/email.service';

@Module({
  controllers: [EmailController],
  providers: [EmailService],
})
export class EmailModule {}
