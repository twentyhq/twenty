import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationRegistrationResolver } from 'src/engine/core-modules/application/application-registration/application-registration.resolver';
import { ApplicationRegistrationService } from 'src/engine/core-modules/application/application-registration/application-registration.service';
import { ApplicationRegistrationVariableModule } from 'src/engine/core-modules/application/application-registration-variable/application-registration-variable.module';
import { ApplicationTarballService } from 'src/engine/core-modules/application/application-registration/application-tarball.service';
import { ApplicationPackageModule } from 'src/engine/core-modules/application/application-package/application-package.module';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { DomainServerConfigModule } from 'src/engine/core-modules/domain/domain-server-config/domain-server-config.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { FileStorageModule } from 'src/engine/core-modules/file-storage/file-storage.module';
import { FileUrlModule } from 'src/engine/core-modules/file/file-url/file-url.module';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ApplicationRegistrationEntity,
      ApplicationEntity,
      WorkspaceEntity,
    ]),
    ApplicationRegistrationVariableModule,
    ApplicationModule,
    ApplicationPackageModule,
    DomainServerConfigModule,
    FeatureFlagModule,
    PermissionsModule,
    FileStorageModule,
    FileUrlModule,
    WorkspaceCacheStorageModule,
  ],
  providers: [
    ApplicationRegistrationService,
    ApplicationRegistrationResolver,
    ApplicationTarballService,
  ],
  exports: [
    ApplicationRegistrationService,
    ApplicationRegistrationVariableModule,
  ],
})
export class ApplicationRegistrationModule {}
