import { Module } from '@nestjs/common';

import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { ImapSmtpCaldavValidatorModule } from 'src/engine/core-modules/imap-smtp-caldav-connection/services/imap-smtp-caldav-connection-validator.module';
import { MessageQueueModule } from 'src/engine/core-modules/message-queue/message-queue.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { TwentyORMModule } from 'src/engine/twenty-orm/twenty-orm.module';
import { ConnectedAccountModule } from 'src/modules/connected-account/connected-account.module';
import { IMAPAPIsModule } from 'src/modules/connected-account/imap-api/imap-apis.module';
import { MessagingIMAPDriverModule } from 'src/modules/messaging/message-import-manager/drivers/imap/messaging-imap-driver.module';
import { MessagingImportManagerModule } from 'src/modules/messaging/message-import-manager/messaging-import-manager.module';

import { ImapSmtpCaldavResolver } from './imap-smtp-caldav-connection.resolver';

import { ImapSmtpCaldavService } from './services/imap-smtp-caldav-connection.service';

@Module({
  imports: [
    ConnectedAccountModule,
    MessagingIMAPDriverModule,
    IMAPAPIsModule,
    MessagingImportManagerModule,
    MessageQueueModule,
    TwentyORMModule,
    FeatureFlagModule,
    ImapSmtpCaldavValidatorModule,
    PermissionsModule,
  ],
  providers: [ImapSmtpCaldavResolver, ImapSmtpCaldavService],
  exports: [ImapSmtpCaldavService],
})
export class ImapSmtpCaldavModule {}
