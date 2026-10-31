import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationAuthorizationEntity } from 'src/engine/core-modules/application/application-authorization/application-authorization.entity';
import { ApplicationAuthorizationResolver } from 'src/engine/core-modules/application/application-authorization/application-authorization.resolver';
import { WorkspaceApplicationAuthorizationResolver } from 'src/engine/core-modules/application/application-authorization/workspace-application-authorization.resolver';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';
import { ApplicationAuthorizationService } from 'src/engine/core-modules/application/application-authorization/services/application-authorization.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ApplicationAuthorizationEntity,
      ApplicationEntity,
    ]),
    PermissionsModule,
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
