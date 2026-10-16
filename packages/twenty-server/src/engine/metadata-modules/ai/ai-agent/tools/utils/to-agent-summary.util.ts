import { type FlatAgentWithRoleId } from 'src/engine/metadata-modules/flat-agent/types/flat-agent.type';

export const toAgentSummary = (agent: FlatAgentWithRoleId) => ({
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
  isCustom: agent.isCustom,
});
