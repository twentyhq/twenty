import { Module } from '@nestjs/common';

import { DataloaderService } from 'src/engine/dataloaders/dataloader.service';
import { FieldMetadataModule } from 'src/engine/metadata-modules/field-metadata/field-metadata.module';
import { WorkspaceMetadataCacheModule } from 'src/engine/metadata-modules/workspace-metadata-cache/workspace-metadata-cache.module';

@Module({
  imports: [FieldMetadataModule, WorkspaceMetadataCacheModule],
  providers: [DataloaderService],
  exports: [DataloaderService],
})
export class DataloaderModule {}
