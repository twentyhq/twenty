import { DynamicModule, Global, Provider } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  AiDriver,
  AiModuleAsyncOptions,
} from 'src/engine/core-modules/ai/interfaces/ai.interface';

import { AI_DRIVER } from 'src/engine/core-modules/ai/ai.constants';
import { AiService } from 'src/engine/core-modules/ai/services/ai.service';
import { AiController } from 'src/engine/core-modules/ai/controllers/ai.controller';
import { OpenAIDriver } from 'src/engine/core-modules/ai/drivers/openai.driver';
import { AIBillingService } from 'src/engine/core-modules/ai/services/ai-billing.service';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { McpController } from 'src/engine/core-modules/ai/controllers/mcp.controller';
import { AuthModule } from 'src/engine/core-modules/auth/auth.module';
import { ToolService } from 'src/engine/core-modules/ai/services/tool.service';
import { McpService } from 'src/engine/core-modules/ai/services/mcp.service';
import { ObjectMetadataModule } from 'src/engine/metadata-modules/object-metadata/object-metadata.module';
import { WorkspacePermissionsCacheModule } from 'src/engine/metadata-modules/workspace-permissions-cache/workspace-permissions-cache.module';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';
import { UserRoleModule } from 'src/engine/metadata-modules/user-role/user-role.module';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';

@Global()
export class AiModule {
  static forRoot(options: AiModuleAsyncOptions): DynamicModule {
    const provider: Provider = {
      provide: AI_DRIVER,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      useFactory: (...args: any[]) => {
        const config = options.useFactory(...args);

        switch (config?.type) {
          case AiDriver.OPENAI: {
            return new OpenAIDriver();
          }
        }
      },
      inject: options.inject || [],
    };

    return {
      module: AiModule,
      imports: [
        TypeOrmModule.forFeature([RoleEntity], 'core'),
        FeatureFlagModule,
        ObjectMetadataModule,
        WorkspacePermissionsCacheModule,
        WorkspaceCacheStorageModule,
        UserRoleModule,
        AuthModule,
      ],
      controllers: [AiController, McpController],
      providers: [
        AiService,
        ToolService,
        AIBillingService,
        McpService,
        provider,
      ],
      exports: [AiService, AIBillingService, ToolService, McpService],
    };
  }
}
