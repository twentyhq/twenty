import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationRegistrationLookupModule } from 'src/engine/core-modules/application/application-registration/application-registration-lookup/application-registration-lookup.module';
import { ApplicationRegistrationModule } from 'src/engine/core-modules/application/application-registration/application-registration.module';
import { ApplicationManifestModule } from 'src/engine/core-modules/application/application-manifest/application-manifest.module';
import { ApplicationLookupModule } from 'src/engine/core-modules/application/application-lookup/application-lookup.module';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { ApplicationPackageModule } from 'src/engine/core-modules/application/application-package/application-package.module';
import { ApplicationDevelopmentResolver } from 'src/engine/core-modules/application/application-development/application-development.resolver';
import { ApplicationDevelopmentService } from 'src/engine/core-modules/application/application-development/application-development.service';
import { ApplicationExportResolver } from 'src/engine/core-modules/application/application-development/application-export.resolver';
import { ApplicationSchemaResolver } from 'src/engine/core-modules/application/application-development/application-schema.resolver';
import { ApplicationFileUploadService } from 'src/engine/core-modules/application/application-development/application-file-upload.service';
import { CacheLockModule } from 'src/engine/core-modules/cache-lock/cache-lock.module';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { FileUploadModule } from 'src/engine/core-modules/file/file-upload/file-upload.module';
import { ThrottlerModule } from 'src/engine/core-modules/throttler/throttler.module';
import { WorkspaceGraphqlSchemaSDLModule } from 'src/engine/api/graphql/workspace-graphql-schema-sdl/workspace-graphql-schema-sdl.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';

@Module({
  imports: [
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    ApplicationLookupModule,
    ApplicationModule,
    ApplicationManifestModule,
    ApplicationPackageModule,
    ApplicationRegistrationLookupModule,
    ApplicationRegistrationModule,
    CacheLockModule,
    FileUploadModule,
    PermissionsModule,
    ThrottlerModule,
    TypeOrmModule.forFeature([FileEntity]),
    WorkspaceCacheModule,
    WorkspaceGraphqlSchemaSDLModule,
  ],
  providers: [
    ApplicationDevelopmentResolver,
    ApplicationDevelopmentService,
    ApplicationExportResolver,
    ApplicationSchemaResolver,
    ApplicationFileUploadService,
    provideWorkspaceScopedRepository(FileEntity),
  ],
})
export class ApplicationDevelopmentModule {}
