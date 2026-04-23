import { type AgentManifest } from 'twenty-shared/application';

import { AUTO_SELECT_SMART_MODEL_ID } from 'twenty-shared/constants';
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
    modelId: (agentManifest.modelId as ModelId) ?? AUTO_SELECT_SMART_MODEL_ID,
    responseFormat: { type: 'text' },
    modelConfiguration: null,
    evaluationInputs: [],
    isCustom: false,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };
};
