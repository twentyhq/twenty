import { Module, forwardRef } from '@nestjs/common';

import { MessageChannelModule } from 'src/business/modules/message/repositories/message-channel/message-channel.module';
import { MessageChannelMessageAssociationModule } from 'src/business/modules/message/repositories/message-channel-message-association/message-channel-message-assocation.module';
import { MessageParticipantModule } from 'src/business/modules/message/repositories/message-participant/message-participant.module';
import { MessageThreadModule } from 'src/business/modules/message/repositories/message-thread/message-thread.module';
import { MessageService } from 'src/business/modules/message/repositories/message/message.service';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { CreateCompaniesAndContactsModule } from 'src/engine-workspace/auto-companies-and-contacts-creation/create-company-and-contact/create-company-and-contact.module';

@Module({
  imports: [
    WorkspaceDataSourceModule,
    forwardRef(() => MessageThreadModule),
    MessageParticipantModule,
    MessageChannelMessageAssociationModule,
    MessageChannelModule,
    CreateCompaniesAndContactsModule,
  ],
  providers: [MessageService],
  exports: [MessageService],
})
export class MessageModule {}
