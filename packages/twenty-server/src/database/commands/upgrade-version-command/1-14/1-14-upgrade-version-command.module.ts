import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DeleteRemovedAgentsCommand } from 'src/database/commands/upgrade-version-command/1-14/1-14-delete-removed-agents.command';
import { UpdateCreatedByEnumCommand } from 'src/database/commands/upgrade-version-command/1-14/1-14-update-created-by-enum.command';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AiAgentModule } from 'src/engine/metadata-modules/ai/ai-agent/ai-agent.module';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { RoleModule } from 'src/engine/metadata-modules/role/role.module';
import { WorkspaceSchemaManagerModule } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkspaceEntity, FieldMetadataEntity]),
    DataSourceModule,
    AiAgentModule,
    RoleModule,
    WorkspaceSchemaManagerModule,
    WorkspaceCacheModule,
  ],
  providers: [UpdateCreatedByEnumCommand, DeleteRemovedAgentsCommand],
  exports: [DeleteRemovedAgentsCommand, UpdateCreatedByEnumCommand],
})
export class V1_14_UpgradeVersionCommandModule {}
