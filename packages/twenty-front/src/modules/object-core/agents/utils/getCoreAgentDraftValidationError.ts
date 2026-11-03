import { type CoreAgentSettings } from '@/object-core/agents/types/CoreAgentSettings';
import { getCoreAgentTriggersValidationError } from '@/object-core/agents/utils/getCoreAgentTriggersValidationError';
import { coreAgentFormSchema } from '@/object-core/agents/validation-schemas/coreAgentFormSchema';
import { t } from '@lingui/core/macro';

const settingsSchema = coreAgentFormSchema.pick({
  description: true,
  prompt: true,
  modelId: true,
  modelConfiguration: true,
});

export const getCoreAgentDraftValidationError = (
  draft: CoreAgentSettings,
): string | null => {
  if (!settingsSchema.safeParse(draft).success) {
    return t`Instructions and a model are required.`;
  }

  return getCoreAgentTriggersValidationError(draft.triggers);
};
