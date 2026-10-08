import { type AgentManifest } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { AUTO_SELECT_WORKSPACE_DEFAULT_MODEL_ID } from 'twenty-shared/ai';
import { type ModelId } from 'src/engine/metadata-modules/ai/ai-models/types/model-id.type';
import { type UniversalFlatAgent } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-agent.type';

export const fromAgentManifestToUniversalFlatAgent = ({
  agentManifest,
  applicationUniversalIdentifier,
  now,
}: {
  agentManifest: AgentManifest;
  applicationUniversalIdentifier: string;
  now: string;
}): UniversalFlatAgent => {
  return {
    universalIdentifier: agentManifest.universalIdentifier,
    applicationUniversalIdentifier,
    name: agentManifest.name,
    label: agentManifest.label,
    icon: agentManifest.icon ?? null,
    description: agentManifest.description ?? null,
    prompt: agentManifest.prompt,
    modelId:
      (agentManifest.modelId as ModelId) ??
      AUTO_SELECT_WORKSPACE_DEFAULT_MODEL_ID,
    responseFormat: agentManifest.responseFormat ?? { type: 'text' },
    modelConfiguration: null,
    triggers: (agentManifest.triggers ?? []).map(
      ({ universalIdentifier, isActive, instructions, ...trigger }) => ({
        ...trigger,
        id: universalIdentifier,
        isActive: isActive ?? true,
        instructions: isDefined(instructions) ? instructions : null,
      }),
    ),
    isCustom: false,
    isSystem: true,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };
};
