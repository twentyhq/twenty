import { Module } from '@nestjs/common';

import { MessageFindManyPreQueryHook } from 'src/business/modules/message/query-hooks/message/message-find-many.pre-query.hook';
import { MessageFindOnePreQueryHook } from 'src/business/modules/message/query-hooks/message/message-find-one.pre-query-hook';
import { ConnectedAccountModule } from 'src/business/modules/calendar-and-messaging/repositories/connected-account/connected-account.module';
import { MessageChannelMessageAssociationModule } from 'src/business/modules/message/repositories/message-channel-message-association/message-channel-message-assocation.module';
import { MessageChannelModule } from 'src/business/modules/message/repositories/message-channel/message-channel.module';
import { WorkspaceMemberModule } from 'src/engine-workspace/repositories/workspace-member/workspace-member.module';

@Module({
  imports: [
    MessageChannelMessageAssociationModule,
    MessageChannelModule,
    ConnectedAccountModule,
    WorkspaceMemberModule,
  ],
  providers: [
    {
      provide: MessageFindOnePreQueryHook.name,
      useClass: MessageFindOnePreQueryHook,
    },
    {
      provide: MessageFindManyPreQueryHook.name,
      useClass: MessageFindManyPreQueryHook,
    },
  ],
})
export class MessagingQueryHookModule {}
