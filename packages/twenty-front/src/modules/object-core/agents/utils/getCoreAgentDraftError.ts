import { t } from '@lingui/core/macro';

import { type CoreAgentDraft } from '@/object-core/agents/types/CoreAgentDraft';
import { coreAgentFormSchema } from '@/object-core/agents/validation-schemas/coreAgentFormSchema';

export const getCoreAgentDraftError = (draft: CoreAgentDraft) => {
  const validation = coreAgentFormSchema.safeParse(draft);

  if (validation.success) {
    return undefined;
  }

  const [issue] = validation.error.issues;

  switch (issue?.path[0]) {
    case 'label':
      return t`Agent name cannot be empty`;
    case 'prompt':
      return t`Instructions cannot be empty`;
    default:
      return issue?.message;
  }
};
