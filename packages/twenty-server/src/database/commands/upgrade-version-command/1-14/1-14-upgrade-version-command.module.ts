import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BackfillSearchFieldMetadataCommand } from 'src/database/commands/upgrade-version-command/1-14/1-14-backfill-search-field-metadata.command';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { SearchFieldMetadataEntity } from 'src/engine/metadata-modules/search-field-metadata/search-field-metadata.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WorkspaceEntity,
      ObjectMetadataEntity,
      SearchFieldMetadataEntity,
    ]),
    DataSourceModule,
  ],
  providers: [BackfillSearchFieldMetadataCommand],
  exports: [BackfillSearchFieldMetadataCommand],
})
export class V1_14_UpgradeVersionCommandModule {}
