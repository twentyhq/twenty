import { Module } from '@nestjs/common';

import { AiAgentModule } from 'src/engine/metadata-modules/ai/ai-agent/ai-agent.module';
import { CreateAgentTool } from 'src/engine/metadata-modules/ai/ai-agent/tools/create-agent.tool';
import { DeleteAgentTool } from 'src/engine/metadata-modules/ai/ai-agent/tools/delete-agent.tool';
import { ListAgentsTool } from 'src/engine/metadata-modules/ai/ai-agent/tools/list-agents.tool';
import { UpdateAgentTool } from 'src/engine/metadata-modules/ai/ai-agent/tools/update-agent.tool';

@Module({
  imports: [AiAgentModule],
  providers: [
    ListAgentsTool,
    CreateAgentTool,
    UpdateAgentTool,
    DeleteAgentTool,
  ],
})
export class AgentToolsModule {}
