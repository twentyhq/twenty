import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { type BrowsingContext } from '@/ai-chat/types/BrowsingContext';
import { type SettingsExpressionDraft } from '@/ai-chat/types/SettingsExpressionDraft';

export const buildSettingsPageBrowsingContext = ({
  path,
  draft,
  isDraftEnabled,
}: {
  path: string;
  draft: SettingsExpressionDraft | null;
  isDraftEnabled: boolean;
}): BrowsingContext => {
  if (
    !isDraftEnabled ||
    !isDefined(draft) ||
    !isNonEmptyString(draft.expression.trim())
  ) {
    return { type: 'settingsPage', path };
  }

  return { type: 'settingsPage', path, draft };
};
