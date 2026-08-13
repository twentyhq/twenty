import { Module } from '@nestjs/common';

import { FrontComponentSharedDependenciesController } from 'src/engine/core-modules/application/front-component-shared-dependencies/front-component-shared-dependencies.controller';
import { FrontComponentSharedDependenciesService } from 'src/engine/core-modules/application/front-component-shared-dependencies/front-component-shared-dependencies.service';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { FileStorageModule } from 'src/engine/core-modules/file-storage/file-storage.module';
import { TwentyConfigModule } from 'src/engine/core-modules/twenty-config/twenty-config.module';

@Module({
  imports: [ApplicationModule, FileStorageModule, TwentyConfigModule],
  controllers: [FrontComponentSharedDependenciesController],
  providers: [FrontComponentSharedDependenciesService],
})
export class FrontComponentSharedDependenciesModule {}
