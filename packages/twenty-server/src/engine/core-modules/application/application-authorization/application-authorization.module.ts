import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationAuthorizationEntity } from 'src/engine/core-modules/application/application-authorization/application-authorization.entity';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { ApplicationAuthorizationResolver } from 'src/engine/core-modules/application/application-authorization/application-authorization.resolver';
import { WorkspaceApplicationAuthorizationResolver } from 'src/engine/core-modules/application/application-authorization/workspace-application-authorization.resolver';
import { WellKnownOAuthClientModule } from 'src/engine/core-modules/application/well-known-oauth-client/well-known-oauth-client.module';
import { PermissionsModule } from 'src/engine/permissions/permissions.module';
import { ApplicationAuthorizationService } from 'src/engine/core-modules/application/application-authorization/services/application-authorization.service';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ApplicationAuthorizationEntity,
      ApplicationEntity,
      UserWorkspaceEntity,
    ]),
    PermissionsModule,
    WellKnownOAuthClientModule,
  ],
  providers: [
    ApplicationAuthorizationService,
    ApplicationAuthorizationResolver,
    WorkspaceApplicationAuthorizationResolver,
    provideWorkspaceScopedRepository(ApplicationEntity),
  ],
  exports: [ApplicationAuthorizationService],
})
export class ApplicationAuthorizationModule {}
