import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';

import { ConnectedAccountModule } from 'src/business/modules/calendar-and-messaging/repositories/connected-account/connected-account.module';
import { MessageChannelMessageAssociationModule } from 'src/business/modules/message/repositories/message-channel-message-association/message-channel-message-assocation.module';
import { MessageChannelModule } from 'src/business/modules/message/repositories/message-channel/message-channel.module';
import { MessageThreadModule } from 'src/business/modules/message/repositories/message-thread/message-thread.module';
import { EnvironmentModule } from 'src/integrations/environment/environment.module';
import { MessagingPersonListener } from 'src/business/modules/message/listeners/messaging-person.listener';
import { MessageModule } from 'src/business/modules/message/repositories/message/message.module';
import { GmailClientProvider } from 'src/business/modules/message/services/providers/gmail/gmail-client.provider';
import { CreateContactService } from 'src/engine-workspace/auto-companies-and-contacts-creation/create-contact/create-contact.service';
import { CreateCompanyService } from 'src/engine-workspace/auto-companies-and-contacts-creation/create-company/create-company.service';
import { FetchMessagesByBatchesService } from 'src/business/modules/message/services/fetch-messages-by-batches.service';
import { GmailFullSyncService } from 'src/business/modules/message/services/gmail-full-sync.service';
import { GmailPartialSyncService } from 'src/business/modules/message/services/gmail-partial-sync.service';
import { GoogleAPIsRefreshAccessTokenService } from 'src/business/modules/calendar-and-messaging/services/google-apis-refresh-access-token.service';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { MessageParticipantModule } from 'src/business/modules/message/repositories/message-participant/message-participant.module';
import { MessagingWorkspaceMemberListener } from 'src/business/modules/message/listeners/messaging-workspace-member.listener';
import { MessagingMessageChannelListener } from 'src/business/modules/message/listeners/messaging-message-channel.listener';
import { MessageService } from 'src/business/modules/message/repositories/message/message.service';
import { WorkspaceMemberModule } from 'src/engine-workspace/repositories/workspace-member/workspace-member.module';
import { FeatureFlagEntity } from 'src/engine/modules/feature-flag/feature-flag.entity';
import { CreateCompaniesAndContactsModule } from 'src/engine-workspace/auto-companies-and-contacts-creation/create-company-and-contact/create-company-and-contact.module';
import { CompanyModule } from 'src/business/modules/message/repositories/company/company.module';
import { PersonModule } from 'src/engine-workspace/repositories/person/person.module';
import { SaveMessagesAndCreateContactsService } from 'src/business/modules/message/services/save-messages-and-create-contacts.service';
import { MessagingConnectedAccountListener } from 'src/business/modules/message/listeners/messaging-connected-account.listener';
import { BlocklistModule } from 'src/business/modules/calendar-and-messaging/repositories/blocklist/blocklist.module';
import { FetchByBatchesService } from 'src/business/modules/message/services/fetch-by-batch.service';
@Module({
  imports: [
    EnvironmentModule,
    WorkspaceDataSourceModule,
    ConnectedAccountModule,
    MessageChannelModule,
    MessageChannelMessageAssociationModule,
    MessageModule,
    MessageThreadModule,
    MessageParticipantModule,
    CreateCompaniesAndContactsModule,
    WorkspaceMemberModule,
    TypeOrmModule.forFeature([FeatureFlagEntity], 'core'),
    CompanyModule,
    PersonModule,
    BlocklistModule,
    HttpModule.register({
      baseURL: 'https://www.googleapis.com/batch/gmail/v1',
    }),
  ],
  providers: [
    GmailFullSyncService,
    GmailPartialSyncService,
    FetchMessagesByBatchesService,
    GoogleAPIsRefreshAccessTokenService,
    GmailClientProvider,
    CreateContactService,
    CreateCompanyService,
    MessagingPersonListener,
    MessagingWorkspaceMemberListener,
    MessagingMessageChannelListener,
    MessageService,
    SaveMessagesAndCreateContactsService,
    MessagingConnectedAccountListener,
    FetchByBatchesService,
  ],
  exports: [
    GmailPartialSyncService,
    GmailFullSyncService,
    GoogleAPIsRefreshAccessTokenService,
    FetchByBatchesService,
  ],
})
export class MessagingModule {}
