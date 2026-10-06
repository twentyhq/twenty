import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationLookupModule } from 'src/engine/core-modules/application/application-lookup/application-lookup.module';
import { ApplicationRegistrationLookupModule } from 'src/engine/core-modules/application/application-registration/application-registration-lookup/application-registration-lookup.module';
import { ApplicationVariableUserValueEntity } from 'src/engine/core-modules/application/application-variable/application-variable-user-value.entity';
import { ApplicationVariableUserValueResolver } from 'src/engine/core-modules/application/application-variable/application-variable-user-value.resolver';
import { ApplicationVariableUserValueService } from 'src/engine/core-modules/application/application-variable/application-variable-user-value.service';
import { ApplicationVariableEntity } from 'src/engine/core-modules/application/application-variable/application-variable.entity';
import { ApplicationVariableEntityResolver } from 'src/engine/core-modules/application/application-variable/application-variable.resolver';
import { ApplicationVariableEntityService } from 'src/engine/core-modules/application/application-variable/application-variable.service';
import { SecretEncryptionModule } from 'src/engine/core-modules/secret-encryption/secret-encryption.module';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { FlatApplicationVariableModule } from 'src/engine/metadata-modules/flat-application-variable/flat-application-variable.module';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ApplicationVariableEntity,
      ApplicationVariableUserValueEntity,
      UserWorkspaceEntity,
    ]),
    ApplicationLookupModule,
    ApplicationRegistrationLookupModule,
    PermissionsModule,
    WorkspaceCacheModule,
    SecretEncryptionModule,
    FlatApplicationVariableModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
  ],
  providers: [
    provideWorkspaceScopedRepository(ApplicationVariableEntity),
    provideWorkspaceScopedRepository(ApplicationVariableUserValueEntity),
    provideWorkspaceScopedRepository(UserWorkspaceEntity),
    ApplicationVariableEntityService,
    ApplicationVariableEntityResolver,
    ApplicationVariableUserValueService,
    ApplicationVariableUserValueResolver,
  ],
  exports: [
    ApplicationVariableEntityService,
    ApplicationVariableUserValueService,
  ],
})
export class ApplicationVariableEntityModule {}
