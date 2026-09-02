import { Module } from '@nestjs/common';

import { ApplicationAsyncOperationResolver } from 'src/engine/core-modules/application/application-async-operation/application-async-operation.resolver';
import { ApplicationAsyncOperationService } from 'src/engine/core-modules/application/application-async-operation/application-async-operation.service';
import { ApplicationManifestModule } from 'src/engine/core-modules/application/application-manifest/application-manifest.module';
import { MarketplaceModule } from 'src/engine/core-modules/application/application-marketplace/marketplace.module';
import { ApplicationPackageModule } from 'src/engine/core-modules/application/application-package/application-package.module';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';

@Module({
  imports: [
    ApplicationModule,
    ApplicationManifestModule,
    ApplicationPackageModule,
    MarketplaceModule,
    PermissionsModule,
  ],
  providers: [
    ApplicationAsyncOperationResolver,
    ApplicationAsyncOperationService,
  ],
  exports: [ApplicationAsyncOperationService],
})
export class ApplicationAsyncOperationModule {}
