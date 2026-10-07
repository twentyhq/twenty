import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from 'src/engine/core-modules/auth/auth.module';
import { WorkspaceDomainsModule } from 'src/engine/core-modules/domain/workspace-domains/workspace-domains.module';
import { EventLogEmitterModule } from 'src/engine/core-modules/event-logs/emit/event-log-emitter.module';
import { ImpersonationAuthorizationModule } from 'src/engine/core-modules/impersonation/impersonation-authorization.module';
import { ImpersonationResolver } from 'src/engine/core-modules/impersonation/impersonation.resolver';
import { ImpersonationService } from 'src/engine/core-modules/impersonation/services/impersonation.service';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { UserSessionModule } from 'src/engine/core-modules/user-session/user-session.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';

@Module({
  imports: [
    AuthModule,
    ImpersonationAuthorizationModule,
    PermissionsModule,
    EventLogEmitterModule,
    TypeOrmModule.forFeature([UserWorkspaceEntity]),
    WorkspaceDomainsModule,
    PermissionsModule,
    UserSessionModule,
  ],
  providers: [ImpersonationService, ImpersonationResolver],
})
export class ImpersonationModule {}
