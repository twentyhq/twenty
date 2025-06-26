import { Module } from '@nestjs/common';

import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { IMAP_SMTP_CALDEVValidatorModule } from 'src/engine/core-modules/imap-smtp-caldav-connection/services/imap-smtp-caldav-connection-validator.module';
import { MessageQueueModule } from 'src/engine/core-modules/message-queue/message-queue.module';
import { TwentyORMModule } from 'src/engine/twenty-orm/twenty-orm.module';
import { ConnectedAccountModule } from 'src/modules/connected-account/connected-account.module';
import { IMAPAPIsModule } from 'src/modules/connected-account/imap-api/imap-apis.module';
import { MessagingIMAPDriverModule } from 'src/modules/messaging/message-import-manager/drivers/imap/messaging-imap-driver.module';
import { MessagingImportManagerModule } from 'src/modules/messaging/message-import-manager/messaging-import-manager.module';

import { IMAP_SMTP_CALDEVResolver } from './imap-smtp-caldav-connection.resolver';

import { IMAP_SMTP_CALDEVService } from './services/imap-smtp-caldav-connection.service';

@Module({
  imports: [
    ConnectedAccountModule,
    MessagingIMAPDriverModule,
    IMAPAPIsModule,
    MessagingImportManagerModule,
    MessageQueueModule,
    TwentyORMModule,
    FeatureFlagModule,
    IMAP_SMTP_CALDEVValidatorModule,
  ],
  providers: [IMAP_SMTP_CALDEVResolver, IMAP_SMTP_CALDEVService],
  exports: [IMAP_SMTP_CALDEVService],
})
export class IMAP_SMTP_CALDEVModule {}
