import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceExportCommand } from 'src/database/commands/workspace-export/workspace-export.command';
import { WorkspaceExportService } from 'src/database/commands/workspace-export/workspace-export.service';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ObjectMetadataEntity, FieldMetadataEntity]),
  ],
  providers: [WorkspaceExportCommand, WorkspaceExportService],
})
export class WorkspaceExportModule {}
