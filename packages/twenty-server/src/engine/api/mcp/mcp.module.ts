import { Module } from '@nestjs/common';

import { McpCoreController } from 'src/engine/api/mcp/controllers/mcp-core.controller';
import { McpProtocolService } from 'src/engine/api/mcp/services/mcp-protocol.service';
import { McpToolExecutorService } from 'src/engine/api/mcp/services/mcp-tool-executor.service';
import { ApiKeyModule } from 'src/engine/core-modules/api-key/api-key.module';
import { TokenModule } from 'src/engine/core-modules/auth/token/token.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { ToolProviderModule } from 'src/engine/core-modules/tool-provider/tool-provider.module';
import { SkillModule } from 'src/engine/metadata-modules/skill/skill.module';
import { UserRoleModule } from 'src/engine/metadata-modules/user-role/user-role.module';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';

@Module({
  imports: [
    ApiKeyModule,
    TokenModule,
    WorkspaceCacheStorageModule,
    FeatureFlagModule,
    UserRoleModule,
    ToolProviderModule,
    SkillModule,
  ],
  controllers: [McpCoreController],
  exports: [McpProtocolService],
  providers: [McpProtocolService, McpToolExecutorService],
})
export class McpModule {}
