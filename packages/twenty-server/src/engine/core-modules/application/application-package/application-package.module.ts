import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationDependencyFilesService } from 'src/engine/core-modules/application/application-package/application-dependency-files.service';
import { ApplicationPackageFetcherService } from 'src/engine/core-modules/application/application-package/application-package-fetcher.service';
import { ApplicationVersionValidationService } from 'src/engine/core-modules/application/application-package/application-version-validation.service';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { SecureHttpClientModule } from 'src/engine/core-modules/secure-http-client/secure-http-client.module';
import { UpgradeStatusModule } from 'src/engine/core-modules/upgrade/upgrade-status.module';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';

@Module({
  imports: [
    SecureHttpClientModule,
    UpgradeStatusModule,
    TypeOrmModule.forFeature([FileEntity, ApplicationEntity]),
  ],
  providers: [
    ApplicationDependencyFilesService,
    ApplicationPackageFetcherService,
    ApplicationVersionValidationService,
    provideWorkspaceScopedRepository(ApplicationEntity),
  ],
  exports: [
    ApplicationDependencyFilesService,
    ApplicationPackageFetcherService,
    ApplicationVersionValidationService,
  ],
})
export class ApplicationPackageModule {}
