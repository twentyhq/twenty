import { type AgentManifest } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { AUTO_SELECT_WORKSPACE_DEFAULT_MODEL_ID } from 'twenty-shared/ai';
import { toStoredDatabaseEventTriggerSettingsOrThrow } from 'src/engine/core-modules/application/application-manifest/utils/to-stored-database-event-trigger-settings-or-throw.util';
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
    avatarColor: agentManifest.avatarColor ?? null,
    avatarShape: agentManifest.avatarShape ?? null,
    description: agentManifest.description ?? null,
    prompt: agentManifest.prompt,
    modelId:
      (agentManifest.modelId as ModelId) ??
      AUTO_SELECT_WORKSPACE_DEFAULT_MODEL_ID,
    responseFormat: agentManifest.responseFormat ?? { type: 'text' },
    modelConfiguration: agentManifest.modelConfiguration ?? null,
    triggers: (agentManifest.triggers ?? []).map(
      ({ universalIdentifier, isActive, instructions, ...trigger }) => {
        const triggerBase = {
          id: universalIdentifier,
          isActive: isActive ?? true,
          instructions: isDefined(instructions) ? instructions : null,
        };

        return trigger.type === 'EVENT' || trigger.type === 'DATABASE_EVENT'
          ? {
              ...triggerBase,
              type: 'DATABASE_EVENT' as const,
              settings: toStoredDatabaseEventTriggerSettingsOrThrow(
                trigger.settings,
              ),
            }
          : { ...triggerBase, ...trigger };
      },
    ),
    isSystem: agentManifest.isSystem ?? false,
    isActive: true,
    overrides: null,
    navigationMenuItemUniversalIdentifiers: [],
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };
};
