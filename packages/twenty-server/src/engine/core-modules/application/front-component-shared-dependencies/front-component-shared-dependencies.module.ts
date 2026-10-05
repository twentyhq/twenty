import { Module } from '@nestjs/common';

import { FrontComponentSharedDependenciesController } from 'src/engine/core-modules/application/front-component-shared-dependencies/front-component-shared-dependencies.controller';
import { FrontComponentSharedDependenciesService } from 'src/engine/core-modules/application/front-component-shared-dependencies/front-component-shared-dependencies.service';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { FileStorageModule } from 'src/engine/core-modules/file-storage/file-storage.module';
import { TwentyConfigModule } from 'src/engine/core-modules/twenty-config/twenty-config.module';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { ApplicationLookupModule } from 'src/engine/core-modules/application/application-lookup/application-lookup.module';
import { ApplicationRegistrationLookupModule } from 'src/engine/core-modules/application/application-registration/application-registration-lookup/application-registration-lookup.module';

@Module({
  imports: [
    ApplicationLookupModule,
    ApplicationRegistrationLookupModule,
    ApplicationModule,
    FileStorageModule,
    TwentyConfigModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
  ],
  controllers: [FrontComponentSharedDependenciesController],
  providers: [FrontComponentSharedDependenciesService],
})
export class FrontComponentSharedDependenciesModule {}
