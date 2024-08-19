import { Module } from '@nestjs/common';

import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';
import { NestjsQueryGraphQLModule } from '@ptc-org/nestjs-query-graphql';

import { InvitationService } from 'src/engine/core-modules/invitation/services/invitation.service';
import { InvitationResolver } from 'src/engine/core-modules/invitation/invitation.resolver';
import { invitationAutoResolverOpts } from 'src/engine/core-modules/invitation/invitation.auto-resolver-opts';
import { AppToken } from 'src/engine/core-modules/app-token/app-token.entity';

import { Invitation } from './invitation.entity';

@Module({
  imports: [
    NestjsQueryTypeOrmModule.forFeature([Invitation, AppToken], 'core'),
    NestjsQueryGraphQLModule.forFeature({
      imports: [NestjsQueryTypeOrmModule.forFeature([Invitation], 'core')],
      resolvers: invitationAutoResolverOpts,
    }),
  ],
  exports: [InvitationService],
  providers: [InvitationService, InvitationResolver],
})
export class InvitationModule {}
