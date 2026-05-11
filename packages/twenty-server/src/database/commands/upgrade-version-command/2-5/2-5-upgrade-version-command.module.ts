import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { RebuildUniquePhoneIndexesCommand } from 'src/database/commands/upgrade-version-command/2-5/2-5-workspace-command-1778000000000-rebuild-unique-phone-indexes.command';
import { NormalizeCompositeFieldDefaultsCommand } from 'src/database/commands/upgrade-version-command/2-5/2-5-workspace-command-1778000001000-normalize-composite-field-defaults.command';
import { FieldMetadataModule } from 'src/engine/metadata-modules/field-metadata/field-metadata.module';
import { WorkspaceSchemaManagerModule } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceSchemaManagerModule,
    FieldMetadataModule,
  ],
  providers: [RebuildUniquePhoneIndexesCommand, NormalizeCompositeFieldDefaultsCommand],
})
export class V2_5_UpgradeVersionCommandModule {}
