import { type AgentManifest } from 'twenty-shared/application';

import {
  DEFAULT_SMART_MODEL,
  type ModelId,
} from 'src/engine/metadata-modules/ai/ai-models/constants/ai-models.const';
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
    modelId: (agentManifest.modelId as ModelId) ?? DEFAULT_SMART_MODEL,
    responseFormat: { type: 'text' },
    modelConfiguration: null,
    evaluationInputs: [],
    isCustom: false,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };
};
