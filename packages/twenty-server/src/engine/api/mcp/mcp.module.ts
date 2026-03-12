import { Module } from '@nestjs/common';

import { McpCoreController } from 'src/engine/api/mcp/controllers/mcp-core.controller';
import { McpAuthGuard } from 'src/engine/api/mcp/guards/mcp-auth.guard';
import { McpProtocolService } from 'src/engine/api/mcp/services/mcp-protocol.service';
import { McpToolExecutorService } from 'src/engine/api/mcp/services/mcp-tool-executor.service';
import { ApiKeyModule } from 'src/engine/core-modules/api-key/api-key.module';
import { TokenModule } from 'src/engine/core-modules/auth/token/token.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { TwentyConfigModule } from 'src/engine/core-modules/twenty-config/twenty-config.module';
import { ToolProviderModule } from 'src/engine/core-modules/tool-provider/tool-provider.module';
import { JwtAuthGuard } from 'src/engine/guards/jwt-auth.guard';
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
    TwentyConfigModule,
  ],
  controllers: [McpCoreController],
  exports: [McpProtocolService],
  providers: [
    JwtAuthGuard,
    McpAuthGuard,
    McpProtocolService,
    McpToolExecutorService,
  ],
})
export class McpModule {}
