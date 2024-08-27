import { Module } from '@nestjs/common';

import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { AppToken } from 'src/engine/core-modules/app-token/app-token.entity';
import { WorkspaceInvitationResolver } from 'src/engine/core-modules/workspace-invitation/workspace-invitation.resolver';
import { WorkspaceInvitationService } from 'src/engine/core-modules/workspace-invitation/services/workspace-invitation.service';

@Module({
  imports: [NestjsQueryTypeOrmModule.forFeature([AppToken], 'core')],
  exports: [WorkspaceInvitationService],
  providers: [WorkspaceInvitationService, WorkspaceInvitationResolver],
})
export class WorkspaceInvitationModule {}
