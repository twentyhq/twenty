import { Injectable } from '@nestjs/common';

import { type ToolSet } from 'ai';

import { AgentService } from 'src/engine/metadata-modules/ai/ai-agent/agent.service';
import { createCreateAgentTool } from 'src/engine/metadata-modules/ai/ai-agent/tools/create-agent.tool';
import { createDeleteAgentTool } from 'src/engine/metadata-modules/ai/ai-agent/tools/delete-agent.tool';
import { createListAgentsTool } from 'src/engine/metadata-modules/ai/ai-agent/tools/list-agents.tool';
import { type AgentToolContext } from 'src/engine/metadata-modules/ai/ai-agent/tools/types/agent-tool-context.type';
import { type AgentToolDependencies } from 'src/engine/metadata-modules/ai/ai-agent/tools/types/agent-tool-dependencies.type';
import { createUpdateAgentTool } from 'src/engine/metadata-modules/ai/ai-agent/tools/update-agent.tool';
import { AiModelRegistryService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';

@Injectable()
export class AgentToolWorkspaceService {
  private readonly deps: AgentToolDependencies;

  constructor(
    agentService: AgentService,
    aiModelRegistryService: AiModelRegistryService,
  ) {
    this.deps = { agentService, aiModelRegistryService };
  }

  generateAgentTools(context: AgentToolContext): ToolSet {
    const listAgents = createListAgentsTool(this.deps, context);
    const createAgent = createCreateAgentTool(this.deps, context);
    const updateAgent = createUpdateAgentTool(this.deps, context);
    const deleteAgent = createDeleteAgentTool(this.deps, context);

    return {
      [listAgents.name]: listAgents,
      [createAgent.name]: createAgent,
      [updateAgent.name]: updateAgent,
      [deleteAgent.name]: deleteAgent,
    };
  }
}
