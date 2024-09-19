import { Module } from '@nestjs/common';

import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { AppToken } from 'src/engine/core-modules/app-token/app-token.entity';
import { TokenModule } from 'src/engine/core-modules/auth/token/token.module';
import { OnboardingModule } from 'src/engine/core-modules/onboarding/onboarding.module';
import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { WorkspaceInvitationService } from 'src/engine/core-modules/workspace-invitation/services/workspace-invitation.service';
import { WorkspaceInvitationResolver } from 'src/engine/core-modules/workspace-invitation/workspace-invitation.resolver';

@Module({
  imports: [
    NestjsQueryTypeOrmModule.forFeature([AppToken, UserWorkspace], 'core'),
    TokenModule,
    OnboardingModule,
  ],
  exports: [WorkspaceInvitationService],
  providers: [WorkspaceInvitationService, WorkspaceInvitationResolver],
})
export class WorkspaceInvitationModule {}
