import type { AgentService } from 'src/engine/metadata-modules/ai/ai-agent/agent.service';
import type { AiModelRegistryService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';

export type AgentToolDependencies = {
  agentService: AgentService;
  aiModelRegistryService: AiModelRegistryService;
};
