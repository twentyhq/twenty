import { Module } from '@nestjs/common';

import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { AiAgentModule } from 'src/engine/metadata-modules/ai/ai-agent/ai-agent.module';
import { CreateAgentTool } from 'src/engine/metadata-modules/ai/ai-agent/tools/create-agent.tool';
import { DeleteAgentTool } from 'src/engine/metadata-modules/ai/ai-agent/tools/delete-agent.tool';
import { ManageableAgentService } from 'src/engine/metadata-modules/ai/ai-agent/tools/services/manageable-agent.service';
import { ListAgentsTool } from 'src/engine/metadata-modules/ai/ai-agent/tools/list-agents.tool';
import { UpdateAgentTool } from 'src/engine/metadata-modules/ai/ai-agent/tools/update-agent.tool';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [AiAgentModule, ApplicationModule, WorkspaceCacheModule],
  providers: [
    ManageableAgentService,
    ListAgentsTool,
    CreateAgentTool,
    UpdateAgentTool,
    DeleteAgentTool,
  ],
})
export class AgentToolsModule {}
