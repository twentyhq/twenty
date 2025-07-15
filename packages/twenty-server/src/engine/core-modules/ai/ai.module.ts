import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AiController } from 'src/engine/core-modules/ai/controllers/ai.controller';
import { McpController } from 'src/engine/core-modules/ai/controllers/mcp.controller';
import { AIBillingService } from 'src/engine/core-modules/ai/services/ai-billing.service';
import { AiModelRegistryService } from 'src/engine/core-modules/ai/services/ai-model-registry.service';
import { AiService } from 'src/engine/core-modules/ai/services/ai.service';
import { McpService } from 'src/engine/core-modules/ai/services/mcp.service';
import { ToolService } from 'src/engine/core-modules/ai/services/tool.service';
import { TokenModule } from 'src/engine/core-modules/auth/token/token.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { ObjectMetadataModule } from 'src/engine/metadata-modules/object-metadata/object-metadata.module';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { UserRoleModule } from 'src/engine/metadata-modules/user-role/user-role.module';
import { WorkspacePermissionsCacheModule } from 'src/engine/metadata-modules/workspace-permissions-cache/workspace-permissions-cache.module';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([RoleEntity], 'core'),
    TokenModule,
    FeatureFlagModule,
    ObjectMetadataModule,
    WorkspacePermissionsCacheModule,
    WorkspaceCacheStorageModule,
    UserRoleModule,
  ],
  controllers: [AiController, McpController],
  providers: [
    AiService,
    AiModelRegistryService,
    ToolService,
    AIBillingService,
    McpService,
  ],
  exports: [
    AiService,
    AiModelRegistryService,
    AIBillingService,
    ToolService,
    McpService,
  ],
})
export class AiModule {}
