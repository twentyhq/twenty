import { Module } from '@nestjs/common';

import { ApplicationRegistrationModule } from 'src/engine/core-modules/application/application-registration/application-registration.module';
import { ApplicationDeployPlanService } from 'src/engine/core-modules/application/application-deploy/application-deploy-plan.service';
import { ApplicationDeployPlanStoreService } from 'src/engine/core-modules/application/application-deploy/application-deploy-plan-store.service';
import { ApplicationManifestModule } from 'src/engine/core-modules/application/application-manifest/application-manifest.module';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { ApplicationDevelopmentResolver } from 'src/engine/core-modules/application/application-development/application-development.resolver';
import { TokenModule } from 'src/engine/core-modules/auth/token/token.module';
import { CacheLockModule } from 'src/engine/core-modules/cache-lock/cache-lock.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { FileStorageModule } from 'src/engine/core-modules/file-storage/file-storage.module';
import { ThrottlerModule } from 'src/engine/core-modules/throttler/throttler.module';
import { SdkClientModule } from 'src/engine/core-modules/sdk-client/sdk-client.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationGraphqlApiExceptionInterceptor } from 'src/engine/workspace-manager/workspace-migration/interceptors/workspace-migration-graphql-api-exception.interceptor';

@Module({
  imports: [
    ApplicationModule,
    ApplicationManifestModule,
    ApplicationRegistrationModule,
    CacheLockModule,
    FeatureFlagModule,
    SdkClientModule,
    TokenModule,
    FileStorageModule,
    PermissionsModule,
    ThrottlerModule,
    WorkspaceCacheModule,
  ],
  providers: [
    ApplicationDevelopmentResolver,
    ApplicationDeployPlanService,
    ApplicationDeployPlanStoreService,
    WorkspaceMigrationGraphqlApiExceptionInterceptor,
  ],
})
export class ApplicationDevelopmentModule {}
