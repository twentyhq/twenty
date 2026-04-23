import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { MessageFolderDataAccessService } from 'src/engine/metadata-modules/message-folder/data-access/services/message-folder-data-access.service';
import { MessageFolderEntity } from 'src/engine/metadata-modules/message-folder/entities/message-folder.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MessageFolderEntity]), FeatureFlagModule],
  providers: [MessageFolderDataAccessService],
  exports: [MessageFolderDataAccessService],
})
export class MessageFolderDataAccessModule {}
