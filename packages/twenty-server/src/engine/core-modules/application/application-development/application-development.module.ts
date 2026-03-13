import { Module } from '@nestjs/common';

import { ApplicationRegistrationModule } from 'src/engine/core-modules/application/application-registration/application-registration.module';
import { ApplicationManifestModule } from 'src/engine/core-modules/application/application-manifest/application-manifest.module';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { ApplicationDevelopmentResolver } from 'src/engine/core-modules/application/application-development/application-development.resolver';
import { TokenModule } from 'src/engine/core-modules/auth/token/token.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { FileStorageModule } from 'src/engine/core-modules/file-storage/file-storage.module';
import { LogicFunctionResourceModule } from 'src/engine/core-modules/logic-function/logic-function-resource/logic-function-resource.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { WorkspaceMigrationGraphqlApiExceptionInterceptor } from 'src/engine/workspace-manager/workspace-migration/interceptors/workspace-migration-graphql-api-exception.interceptor';

@Module({
  imports: [
    ApplicationModule,
    ApplicationManifestModule,
    ApplicationRegistrationModule,
    FeatureFlagModule,
    LogicFunctionResourceModule,
    TokenModule,
    FileStorageModule,
    PermissionsModule,
  ],
  providers: [
    ApplicationDevelopmentResolver,
    WorkspaceMigrationGraphqlApiExceptionInterceptor,
  ],
})
export class ApplicationDevelopmentModule {}
