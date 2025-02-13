import { Module } from '@nestjs/common';

import { NestjsQueryGraphQLModule } from '@ptc-org/nestjs-query-graphql';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { Inbox } from 'src/engine/core-modules/inbox/inbox.entity';
import { InboxResolver } from 'src/engine/core-modules/inbox/inbox.resolver';
import { InboxService } from 'src/engine/core-modules/inbox/inbox.service';

@Module({
  imports: [
    NestjsQueryGraphQLModule.forFeature({
      imports: [NestjsQueryTypeOrmModule.forFeature([Inbox], 'core')],
    }),
  ],
  exports: [InboxService],
  providers: [InboxResolver, InboxService],
})
export class InboxModule {}
