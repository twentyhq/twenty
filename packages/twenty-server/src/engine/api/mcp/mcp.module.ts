import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AiModule } from 'src/engine/core-modules/ai/ai.module';
import { TokenModule } from 'src/engine/core-modules/auth/token/token.module';
import { McpMetadataController } from 'src/engine/api/mcp/controllers/mcp-metadata.controller';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';
import { MCPMetadataService } from 'src/engine/api/mcp/services/mcp-metadata.service';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { RestApiModule } from 'src/engine/api/rest/rest-api.module';
import { MetadataQueryBuilderModule } from 'src/engine/api/rest/metadata/query-builder/metadata-query-builder.module';
import { MCPMetadataToolsService } from 'src/engine/api/mcp/services/tools/mcp-metadata-tools.service';
import { UpdateToolsService } from 'src/engine/api/mcp/services/tools/update.tools.service';
import { CreateToolsService } from 'src/engine/api/mcp/services/tools/create.tools.service';
import { DeleteToolsService } from 'src/engine/api/mcp/services/tools/delete.tools.service';
import { GetToolsService } from 'src/engine/api/mcp/services/tools/get.tools.service';
import { MetricsModule } from 'src/engine/core-modules/metrics/metrics.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RoleEntity], 'core'),
    AiModule,
    TokenModule,
    WorkspaceCacheStorageModule,
    FeatureFlagModule,
    RestApiModule,
    MetadataQueryBuilderModule,
    MetricsModule,
  ],
  controllers: [McpMetadataController],
  exports: [],
  providers: [
    MCPMetadataService,
    MCPMetadataToolsService,
    CreateToolsService,
    UpdateToolsService,
    DeleteToolsService,
    GetToolsService,
  ],
})
export class McpModule {}
