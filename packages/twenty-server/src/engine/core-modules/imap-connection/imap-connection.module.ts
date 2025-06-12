import { Module } from '@nestjs/common';

import { MessageQueueModule } from 'src/engine/core-modules/message-queue/message-queue.module';
import { TwentyORMModule } from 'src/engine/twenty-orm/twenty-orm.module';
import { ConnectedAccountModule } from 'src/modules/connected-account/connected-account.module';
import { IMAPAPIsModule } from 'src/modules/connected-account/imap-api/imap-apis.module';
import { MessagingIMAPDriverModule } from 'src/modules/messaging/message-import-manager/drivers/imap/messaging-imap-driver.module';
import { MessagingImportManagerModule } from 'src/modules/messaging/message-import-manager/messaging-import-manager.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';

import { ImapConnectionResolver } from './imap-connection.resolver';

import { ImapConnectionService } from './services/imap-connection.service';

@Module({
  imports: [
    ConnectedAccountModule,
    MessagingIMAPDriverModule,
    IMAPAPIsModule,
    MessagingImportManagerModule,
    MessageQueueModule,
    TwentyORMModule,
    FeatureFlagModule,
  ],
  providers: [ImapConnectionResolver, ImapConnectionService],
  exports: [ImapConnectionService],
})
export class ImapConnectionModule {}
