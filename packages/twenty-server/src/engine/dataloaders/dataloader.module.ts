import { Module } from '@nestjs/common';

import { DataloaderService } from 'src/engine/dataloaders/dataloader.service';
import { RelationMetadataModule } from 'src/engine/metadata-modules/relation-metadata/relation-metadata.module';

@Module({
  providers: [DataloaderService],
  imports: [RelationMetadataModule],
  exports: [DataloaderService],
})
export class DataloaderModule {}
