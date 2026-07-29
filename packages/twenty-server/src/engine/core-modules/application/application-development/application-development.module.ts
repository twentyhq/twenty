import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationRegistrationModule } from 'src/engine/core-modules/application/application-registration/application-registration.module';
import { ApplicationManifestModule } from 'src/engine/core-modules/application/application-manifest/application-manifest.module';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { ApplicationPackageModule } from 'src/engine/core-modules/application/application-package/application-package.module';
import { ApplicationDevelopmentResolver } from 'src/engine/core-modules/application/application-development/application-development.resolver';
import { ApplicationDevelopmentService } from 'src/engine/core-modules/application/application-development/application-development.service';
import { ApplicationDevelopmentThrottlerService } from 'src/engine/core-modules/application/application-development/application-development-throttler.service';
import { ApplicationFileUploadService } from 'src/engine/core-modules/application/application-development/application-file-upload.service';
import { CacheLockModule } from 'src/engine/core-modules/cache-lock/cache-lock.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { FileStorageModule } from 'src/engine/core-modules/file-storage/file-storage.module';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { FileUploadModule } from 'src/engine/core-modules/file/file-upload/file-upload.module';
import { ThrottlerModule } from 'src/engine/core-modules/throttler/throttler.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';
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
    FileUploadModule,
    PermissionsModule,
    ThrottlerModule,
    TypeOrmModule.forFeature([FileEntity]),
  ],
  providers: [
    ApplicationDevelopmentResolver,
    ApplicationDevelopmentService,
    ApplicationDevelopmentThrottlerService,
    ApplicationFileUploadService,
    WorkspaceMigrationGraphqlApiExceptionInterceptor,
    provideWorkspaceScopedRepository(FileEntity),
  ],
})
export class ApplicationDevelopmentModule {}
