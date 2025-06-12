import { Module } from '@nestjs/common';

import { ImapConnectionValidatorService } from './imap-connection-validator.service';

@Module({
  providers: [ImapConnectionValidatorService],
  exports: [ImapConnectionValidatorService],
})
export class ImapConnectionValidatorModule {}
