import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CoreEntityCacheModule } from 'src/engine/core-entity-cache/core-entity-cache.module';
import { ApplicationAuthorizationEntity } from 'src/engine/core-modules/application/application-authorization/application-authorization.entity';
import { ApplicationAuthorizationResolver } from 'src/engine/core-modules/application/application-authorization/application-authorization.resolver';
import { WorkspaceApplicationAuthorizationResolver } from 'src/engine/core-modules/application/application-authorization/workspace-application-authorization.resolver';
import { ApplicationAuthorizationEntityCacheProviderService } from 'src/engine/core-modules/application/application-authorization/services/application-authorization-entity-cache-provider.service';
import { ApplicationAuthorizationService } from 'src/engine/core-modules/application/application-authorization/services/application-authorization.service';
import { PermissionsModule } from 'src/engine/permissions/permissions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ApplicationAuthorizationEntity]),
    PermissionsModule,
    CoreEntityCacheModule,
  ],
  providers: [
    ApplicationAuthorizationService,
    ApplicationAuthorizationEntityCacheProviderService,
    ApplicationAuthorizationResolver,
    WorkspaceApplicationAuthorizationResolver,
  ],
  exports: [ApplicationAuthorizationService],
})
export class ApplicationAuthorizationModule {}
