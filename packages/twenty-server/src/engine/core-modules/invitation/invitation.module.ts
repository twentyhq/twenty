import { Module } from '@nestjs/common';

import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { InvitationService } from 'src/engine/core-modules/invitation/services/invitation.service';

import { Invitation } from './invitation.entity';

@Module({
  imports: [NestjsQueryTypeOrmModule.forFeature([Invitation], 'core')],
  exports: [InvitationService],
  providers: [InvitationService],
})
export class InvitationModule {}
