import { Module } from '@nestjs/common';

import { ImapSmtpCaldavValidatorModule } from 'src/engine/core-modules/imap-smtp-caldav-connection/services/imap-smtp-caldav-connection-validator.module';
import { SecureHttpClientModule } from 'src/engine/core-modules/secure-http-client/secure-http-client.module';
import { ConnectedAccountMetadataModule } from 'src/engine/metadata-modules/connected-account/connected-account-metadata.module';
import { ConnectedAccountTokenEncryptionModule } from 'src/engine/metadata-modules/connected-account/services/connected-account-token-encryption.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { CalDavDriverModule } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/caldav-driver.module';
import { IMAPAPIsModule } from 'src/modules/connected-account/imap-api/imap-apis.module';

import { ImapSmtpCaldavResolver } from './imap-smtp-caldav-connection.resolver';

import { ImapSmtpCaldavService } from './services/imap-smtp-caldav-connection.service';

@Module({
  imports: [
    ConnectedAccountMetadataModule,
    ConnectedAccountTokenEncryptionModule,
    IMAPAPIsModule,
    ImapSmtpCaldavValidatorModule,
    PermissionsModule,
    SecureHttpClientModule,
    CalDavDriverModule,
  ],
  providers: [ImapSmtpCaldavResolver, ImapSmtpCaldavService],
  exports: [ImapSmtpCaldavService],
})
export class ImapSmtpCaldavModule {}
