import { Module } from '@nestjs/common';

import { GetMessagesService } from 'src/engine/core-modules/messaging/services/get-messages.service';
import { ImapService } from 'src/engine/core-modules/messaging/services/imap.service';
import { TestImapCommand } from 'src/commands/test-imap.command';
import { ImapSyncCron } from 'src/engine/core-modules/messaging/crons/imap-sync.cron';
import { TimelineMessagingService } from 'src/engine/core-modules/messaging/services/timeline-messaging.service';
import { TimelineMessagingResolver } from 'src/engine/core-modules/messaging/timeline-messaging.resolver';
import { UserModule } from 'src/engine/core-modules/user/user.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { ConnectedAccountModule } from 'src/modules/connected-account/connected-account.module';
import { MessagingImportManagerModule } from 'src/modules/messaging/message-import-manager/messaging-import-manager.module';

@Module({
  imports: [
    WorkspaceDataSourceModule,
    UserModule,
    ConnectedAccountModule,
    MessagingImportManagerModule,
  ],
  exports: [ImapService],
  providers: [
    TimelineMessagingResolver,
    TimelineMessagingService,
    GetMessagesService,
    ImapService,
    ImapSyncCron,
    TestImapCommand,
  ],
})
export class TimelineMessagingModule {}
