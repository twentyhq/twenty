import { Module } from '@nestjs/common';

import { SecureHttpClientModule } from 'src/engine/core-modules/secure-http-client/secure-http-client.module';

import { ImapSmtpCaldavValidatorService } from './imap-smtp-caldav-connection-validator.service';

@Module({
  imports: [SecureHttpClientModule],
  providers: [ImapSmtpCaldavValidatorService],
  exports: [ImapSmtpCaldavValidatorService],
})
export class ImapSmtpCaldavValidatorModule {}
