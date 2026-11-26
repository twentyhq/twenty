import { type AgentDTO } from 'src/engine/metadata-modules/ai/ai-agent/dtos/agent.dto';

export const toAgentSummary = (agent: AgentDTO) => ({
  id: agent.id,
  name: agent.name,
  label: agent.label,
  description: agent.description,
  icon: agent.icon,
  prompt: agent.prompt,
  modelId: agent.modelId,
  roleId: agent.roleId,
  triggers: agent.triggers,
  applicationId: agent.applicationId,
});
