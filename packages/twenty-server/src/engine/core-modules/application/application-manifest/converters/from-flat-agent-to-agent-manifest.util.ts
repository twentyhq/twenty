import { AUTO_SELECT_WORKSPACE_DEFAULT_MODEL_ID } from 'twenty-shared/ai';
import {
  type AgentManifest,
  type AgentTrigger,
  type AgentTriggerManifest,
} from 'twenty-shared/application';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { type UniversalFlatAgent } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-agent.type';

const fromAgentTriggerToAgentTriggerManifest = ({
  id,
  isActive,
  instructions,
  ...trigger
}: AgentTrigger): AgentTriggerManifest => ({
  universalIdentifier: id,
  ...trigger,
  ...(isActive ? {} : { isActive }),
  ...(isDefined(instructions) ? { instructions } : {}),
});

export const fromFlatAgentToAgentManifest = ({
  flatAgent,
  roleUniversalIdentifier,
}: {
  flatAgent: Pick<
    UniversalFlatAgent,
    | 'universalIdentifier'
    | 'name'
    | 'label'
    | 'icon'
    | 'description'
    | 'prompt'
    | 'modelId'
    | 'responseFormat'
    | 'triggers'
  >;
  roleUniversalIdentifier?: string;
}): AgentManifest => ({
  universalIdentifier: flatAgent.universalIdentifier,
  name: flatAgent.name,
  label: flatAgent.label,
  ...(isDefined(flatAgent.icon) ? { icon: flatAgent.icon } : {}),
  ...(isDefined(flatAgent.description)
    ? { description: flatAgent.description }
    : {}),
  prompt: flatAgent.prompt,
  ...(flatAgent.modelId === AUTO_SELECT_WORKSPACE_DEFAULT_MODEL_ID
    ? {}
    : { modelId: flatAgent.modelId }),
  ...(isDefined(flatAgent.responseFormat)
    ? { responseFormat: flatAgent.responseFormat }
    : {}),
  ...(isDefined(roleUniversalIdentifier) ? { roleUniversalIdentifier } : {}),
  ...(isNonEmptyArray(flatAgent.triggers)
    ? {
        triggers: flatAgent.triggers.map(
          fromAgentTriggerToAgentTriggerManifest,
        ),
      }
    : {}),
});
