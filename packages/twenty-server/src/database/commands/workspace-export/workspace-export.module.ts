import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceExportCommand } from 'src/database/commands/workspace-export/workspace-export.command';
import { WorkspaceExportService } from 'src/database/commands/workspace-export/workspace-export.service';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { SearchFieldMetadataEntity } from 'src/engine/metadata-modules/search-field-metadata/search-field-metadata.entity';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ObjectMetadataEntity,
      FieldMetadataEntity,
      SearchFieldMetadataEntity,
    ]),
  ],
  providers: [
    WorkspaceExportCommand,
    WorkspaceExportService,
    provideWorkspaceScopedRepository(ObjectMetadataEntity),
    provideWorkspaceScopedRepository(FieldMetadataEntity),
  ],
})
export class WorkspaceExportModule {}
