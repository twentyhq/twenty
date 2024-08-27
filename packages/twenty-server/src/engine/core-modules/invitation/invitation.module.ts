import { Module } from '@nestjs/common';

import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { InvitationService } from 'src/engine/core-modules/invitation/services/invitation.service';
import { InvitationResolver } from 'src/engine/core-modules/invitation/invitation.resolver';
import { AppToken } from 'src/engine/core-modules/app-token/app-token.entity';

@Module({
  imports: [NestjsQueryTypeOrmModule.forFeature([AppToken], 'core')],
  exports: [InvitationService],
  providers: [InvitationService, InvitationResolver],
})
export class InvitationModule {}
