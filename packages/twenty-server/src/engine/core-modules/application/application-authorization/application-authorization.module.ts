import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationAuthorizationEntity } from 'src/engine/core-modules/application/application-authorization/application-authorization.entity';
import { ApplicationAuthorizationResolver } from 'src/engine/core-modules/application/application-authorization/application-authorization.resolver';
import { WorkspaceApplicationAuthorizationResolver } from 'src/engine/core-modules/application/application-authorization/workspace-application-authorization.resolver';
import { ApplicationOAuthIdentityModule } from 'src/engine/core-modules/application/application-oauth-identity/application-oauth-identity.module';
import { PermissionsModule } from 'src/engine/permissions/permissions.module';
import { ApplicationAuthorizationService } from 'src/engine/core-modules/application/application-authorization/services/application-authorization.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ApplicationAuthorizationEntity]),
    PermissionsModule,
    ApplicationOAuthIdentityModule,
  ],
  providers: [
    ApplicationAuthorizationService,
    ApplicationAuthorizationResolver,
    WorkspaceApplicationAuthorizationResolver,
  ],
  exports: [ApplicationAuthorizationService],
})
export class ApplicationAuthorizationModule {}
