import { isDefined } from 'twenty-shared/utils';

import { type BrowsingContext } from '@/ai-chat/types/BrowsingContext';
import { type SettingsExpressionDraft } from '@/ai-chat/types/SettingsExpressionDraft';

export const buildSettingsPageBrowsingContext = ({
  path,
  draft,
  isDraftEnabled,
}: {
  path: string;
  draft: (SettingsExpressionDraft & { path: string }) | null;
  isDraftEnabled: boolean;
}): BrowsingContext => {
  if (!isDraftEnabled || !isDefined(draft) || draft.path !== path) {
    return { type: 'settingsPage', path };
  }

  return {
    type: 'settingsPage',
    path,
    draft: { kind: draft.kind, expression: draft.expression },
  };
};
