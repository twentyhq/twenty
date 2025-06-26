import { Module } from '@nestjs/common';

import { ImapSmtpCaldavValidatorService } from './imap-smtp-caldav-connection-validator.service';

@Module({
  providers: [ImapSmtpCaldavValidatorService],
  exports: [ImapSmtpCaldavValidatorService],
})
export class ImapSmtpCaldavValidatorModule {}
