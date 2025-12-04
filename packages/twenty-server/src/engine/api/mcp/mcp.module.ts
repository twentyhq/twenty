import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { McpCoreController } from 'src/engine/api/mcp/controllers/mcp-core.controller';
import { McpMetadataController } from 'src/engine/api/mcp/controllers/mcp-metadata.controller';
import { MCPMetadataService } from 'src/engine/api/mcp/services/mcp-metadata.service';
import { McpProtocolService } from 'src/engine/api/mcp/services/mcp-protocol.service';
import { McpToolExecutorService } from 'src/engine/api/mcp/services/mcp-tool-executor.service';
import { TokenModule } from 'src/engine/core-modules/auth/token/token.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { MetricsModule } from 'src/engine/core-modules/metrics/metrics.module';
import { AiToolsModule } from 'src/engine/metadata-modules/ai/ai-tools/ai-tools.module';
import { MetadataToolsModule } from 'src/engine/metadata-modules/metadata-tools/metadata-tools.module';
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
    MetricsModule,
    UserRoleModule,
    MetadataToolsModule,
  ],
  controllers: [McpCoreController, McpMetadataController],
  exports: [McpProtocolService],
  providers: [McpProtocolService, McpToolExecutorService, MCPMetadataService],
})
export class McpModule {}
