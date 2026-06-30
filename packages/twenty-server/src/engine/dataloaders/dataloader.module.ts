import { Module } from '@nestjs/common';

import { ApplicationRegistrationVariableModule } from 'src/engine/core-modules/application/application-registration-variable/application-registration-variable.module';
import { ApplicationTranslationModule } from 'src/engine/core-modules/application/application-translation/application-translation.module';
import { DataloaderService } from 'src/engine/dataloaders/dataloader.service';
import { FieldMetadataModule } from 'src/engine/metadata-modules/field-metadata/field-metadata.module';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { WorkspaceTranslationModule } from 'src/engine/metadata-modules/workspace-translation/workspace-translation.module';

@Module({
  imports: [
    FieldMetadataModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    ApplicationRegistrationVariableModule,
    ApplicationTranslationModule,
    WorkspaceTranslationModule,
  ],
  providers: [DataloaderService],
  exports: [DataloaderService],
})
export class DataloaderModule {}
