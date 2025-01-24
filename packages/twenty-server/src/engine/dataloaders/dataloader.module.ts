import { Module } from '@nestjs/common';

import { DataloaderService } from 'src/engine/dataloaders/dataloader.service';
import { FieldMetadataModule } from 'src/engine/metadata-modules/field-metadata/field-metadata.module';
import { RelationMetadataModule } from 'src/engine/metadata-modules/relation-metadata/relation-metadata.module';

@Module({
  imports: [RelationMetadataModule, FieldMetadataModule],
  providers: [DataloaderService],
  exports: [DataloaderService],
})
export class DataloaderModule {}
