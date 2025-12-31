import { Module } from '@nestjs/common';

import { McpCoreController } from 'src/engine/api/mcp/controllers/mcp-core.controller';
import { McpMetadataController } from 'src/engine/api/mcp/controllers/mcp-metadata.controller';
import { MCPMetadataService } from 'src/engine/api/mcp/services/mcp-metadata.service';
import { McpProtocolService } from 'src/engine/api/mcp/services/mcp-protocol.service';
import { McpToolExecutorService } from 'src/engine/api/mcp/services/mcp-tool-executor.service';
import { ApiKeyModule } from 'src/engine/core-modules/api-key/api-key.module';
import { TokenModule } from 'src/engine/core-modules/auth/token/token.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { MetricsModule } from 'src/engine/core-modules/metrics/metrics.module';
import { ToolProviderModule } from 'src/engine/core-modules/tool-provider/tool-provider.module';
import { UserRoleModule } from 'src/engine/metadata-modules/user-role/user-role.module';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';

@Module({
  imports: [
    ApiKeyModule,
    TokenModule,
    WorkspaceCacheStorageModule,
    FeatureFlagModule,
    MetricsModule,
    UserRoleModule,
    ToolProviderModule,
  ],
  controllers: [McpCoreController, McpMetadataController],
  exports: [McpProtocolService],
  providers: [McpProtocolService, McpToolExecutorService, MCPMetadataService],
})
export class McpModule {}
