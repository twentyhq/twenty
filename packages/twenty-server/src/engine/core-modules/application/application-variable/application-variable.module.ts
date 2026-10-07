import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationLookupModule } from 'src/engine/core-modules/application/application-lookup/application-lookup.module';
import { ApplicationRegistrationLookupModule } from 'src/engine/core-modules/application/application-registration/application-registration-lookup/application-registration-lookup.module';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { AppPreferencesResolver } from 'src/engine/core-modules/application/application-variable/app-preferences.resolver';
import { AppPreferencesService } from 'src/engine/core-modules/application/application-variable/app-preferences.service';
import { UserApplicationVariableValueEntity } from 'src/engine/core-modules/application/application-variable/user-application-variable-value.entity';
import { UserApplicationVariableValueResolver } from 'src/engine/core-modules/application/application-variable/user-application-variable-value.resolver';
import { UserApplicationVariableValueService } from 'src/engine/core-modules/application/application-variable/user-application-variable-value.service';
import { ApplicationVariableEntity } from 'src/engine/core-modules/application/application-variable/application-variable.entity';
import { ApplicationVariableEntityResolver } from 'src/engine/core-modules/application/application-variable/application-variable.resolver';
import { ApplicationVariableEntityService } from 'src/engine/core-modules/application/application-variable/application-variable.service';
import { WorkspaceUserApplicationVariableValueMapCacheService } from 'src/engine/core-modules/application/application-variable/workspace-user-application-variable-value-map-cache.service';
import { ConnectionProviderEntity } from 'src/engine/core-modules/application/connection-provider/connection-provider.entity';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
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
      ApplicationEntity,
      ApplicationVariableEntity,
      ConnectionProviderEntity,
      UserApplicationVariableValueEntity,
      UserWorkspaceEntity,
    ]),
    ApplicationLookupModule,
    ApplicationRegistrationLookupModule,
    FeatureFlagModule,
    PermissionsModule,
    WorkspaceCacheModule,
    SecretEncryptionModule,
    FlatApplicationVariableModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
  ],
  providers: [
    provideWorkspaceScopedRepository(ApplicationEntity),
    provideWorkspaceScopedRepository(ApplicationVariableEntity),
    provideWorkspaceScopedRepository(ConnectionProviderEntity),
    provideWorkspaceScopedRepository(UserApplicationVariableValueEntity),
    provideWorkspaceScopedRepository(UserWorkspaceEntity),
    ApplicationVariableEntityService,
    ApplicationVariableEntityResolver,
    UserApplicationVariableValueService,
    UserApplicationVariableValueResolver,
    WorkspaceUserApplicationVariableValueMapCacheService,
    AppPreferencesService,
    AppPreferencesResolver,
  ],
  exports: [
    ApplicationVariableEntityService,
    UserApplicationVariableValueService,
  ],
})
export class ApplicationVariableEntityModule {}
