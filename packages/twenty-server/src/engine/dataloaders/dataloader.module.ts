import { Module } from '@nestjs/common';

import { ApplicationRegistrationVariableModule } from 'src/engine/core-modules/application/application-registration-variable/application-registration-variable.module';
import { ApplicationTranslationModule } from 'src/engine/core-modules/application/application-translation/application-translation.module';
import { DataloaderService } from 'src/engine/dataloaders/dataloader.service';
import { FieldMetadataConnectionLoaderFactory } from 'src/engine/dataloaders/factories/field-metadata-connection-loader.factory';
import { IndexMetadataConnectionLoaderFactory } from 'src/engine/dataloaders/factories/index-metadata-connection-loader.factory';
import { FieldMetadataModule } from 'src/engine/metadata-modules/field-metadata/field-metadata.module';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';

@Module({
  imports: [
    FieldMetadataModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    ApplicationRegistrationVariableModule,
    ApplicationTranslationModule,
  ],
  providers: [
    DataloaderService,
    FieldMetadataConnectionLoaderFactory,
    IndexMetadataConnectionLoaderFactory,
  ],
  exports: [DataloaderService],
})
export class DataloaderModule {}
