import { Module } from '@nestjs/common';

import { DataloaderService } from 'src/engine/dataloaders/dataloader.service';
import { FieldMetadataModule } from 'src/engine/metadata-modules/field-metadata/field-metadata.module';

@Module({
  imports: [FieldMetadataModule],
  providers: [DataloaderService],
  exports: [DataloaderService],
})
export class DataloaderModule {}
