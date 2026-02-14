import { Module } from '@nestjs/common';

import { HostnameGuardModule } from 'src/engine/core-modules/hostname-guard/hostname-guard.module';

import { ImapSmtpCaldavValidatorService } from './imap-smtp-caldav-connection-validator.service';

@Module({
  imports: [HostnameGuardModule],
  providers: [ImapSmtpCaldavValidatorService],
  exports: [ImapSmtpCaldavValidatorService],
})
export class ImapSmtpCaldavValidatorModule {}
