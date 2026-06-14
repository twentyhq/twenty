import { Module } from '@nestjs/common';

import { ApplicationRegistrationVariableModule } from 'src/engine/core-modules/application/application-registration-variable/application-registration-variable.module';
import { DataloaderService } from 'src/engine/dataloaders/dataloader.service';
import { FieldMetadataModule } from 'src/engine/metadata-modules/field-metadata/field-metadata.module';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';

@Module({
  imports: [
    FieldMetadataModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    ApplicationRegistrationVariableModule,
  ],
  providers: [DataloaderService],
  exports: [DataloaderService],
})
export class DataloaderModule {}
