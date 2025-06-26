import { Module } from '@nestjs/common';

import { IMAP_SMTP_CALDEVValidatorService } from './imap-connection-validator.service';

@Module({
  providers: [IMAP_SMTP_CALDEVValidatorService],
  exports: [IMAP_SMTP_CALDEVValidatorService],
})
export class IMAP_SMTP_CALDEVValidatorModule {}
