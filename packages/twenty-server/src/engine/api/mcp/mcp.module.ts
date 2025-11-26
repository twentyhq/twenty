import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { McpCoreController } from 'src/engine/api/mcp/controllers/mcp-core.controller';
import { McpMetadataController } from 'src/engine/api/mcp/controllers/mcp-metadata.controller';
import { MCPMetadataService } from 'src/engine/api/mcp/services/mcp-metadata.service';
import { McpProtocolService } from 'src/engine/api/mcp/services/mcp-protocol.service';
import { McpToolExecutorService } from 'src/engine/api/mcp/services/mcp-tool-executor.service';
import { CreateToolsService } from 'src/engine/api/mcp/services/tools/create.tools.service';
import { DeleteToolsService } from 'src/engine/api/mcp/services/tools/delete.tools.service';
import { GetToolsService } from 'src/engine/api/mcp/services/tools/get.tools.service';
import { MCPMetadataToolsService } from 'src/engine/api/mcp/services/tools/mcp-metadata-tools.service';
import { UpdateToolsService } from 'src/engine/api/mcp/services/tools/update.tools.service';
import { MetadataQueryBuilderModule } from 'src/engine/api/rest/metadata/query-builder/metadata-query-builder.module';
import { RestApiModule } from 'src/engine/api/rest/rest-api.module';
import { AiToolsModule } from 'src/engine/metadata-modules/ai-tools/ai-tools.module';
import { TokenModule } from 'src/engine/core-modules/auth/token/token.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { MetricsModule } from 'src/engine/core-modules/metrics/metrics.module';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { UserRoleModule } from 'src/engine/metadata-modules/user-role/user-role.module';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RoleEntity]),
    AiToolsModule,
    TokenModule,
    WorkspaceCacheStorageModule,
    FeatureFlagModule,
    RestApiModule,
    MetadataQueryBuilderModule,
    MetricsModule,
    UserRoleModule,
  ],
  controllers: [McpCoreController, McpMetadataController],
  exports: [McpProtocolService],
  providers: [
    McpProtocolService,
    McpToolExecutorService,
    MCPMetadataService,
    MCPMetadataToolsService,
    CreateToolsService,
    UpdateToolsService,
    DeleteToolsService,
    GetToolsService,
  ],
})
export class McpModule {}
