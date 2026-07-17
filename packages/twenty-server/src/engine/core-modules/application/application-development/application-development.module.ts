import { Module } from '@nestjs/common';

import { ApplicationRegistrationModule } from 'src/engine/core-modules/application/application-registration/application-registration.module';
import { ApplicationManifestModule } from 'src/engine/core-modules/application/application-manifest/application-manifest.module';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { ApplicationPackageModule } from 'src/engine/core-modules/application/application-package/application-package.module';
import { ApplicationDevelopmentResolver } from 'src/engine/core-modules/application/application-development/application-development.resolver';
import { ApplicationDevelopmentService } from 'src/engine/core-modules/application/application-development/application-development.service';
import { CacheLockModule } from 'src/engine/core-modules/cache-lock/cache-lock.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { FileStorageModule } from 'src/engine/core-modules/file-storage/file-storage.module';
import { ThrottlerModule } from 'src/engine/core-modules/throttler/throttler.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { WorkspaceMigrationGraphqlApiExceptionInterceptor } from 'src/engine/workspace-manager/workspace-migration/interceptors/workspace-migration-graphql-api-exception.interceptor';

@Module({
  imports: [
    ApplicationModule,
    ApplicationManifestModule,
    ApplicationPackageModule,
    ApplicationRegistrationModule,
    CacheLockModule,
    FeatureFlagModule,
    FileStorageModule,
    PermissionsModule,
    ThrottlerModule,
  ],
  providers: [
    ApplicationDevelopmentResolver,
    ApplicationDevelopmentService,
    WorkspaceMigrationGraphqlApiExceptionInterceptor,
  ],
})
export class ApplicationDevelopmentModule {}
