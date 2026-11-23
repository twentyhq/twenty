import { getAgentChatPreviewPlainText } from 'twenty-shared/ai';
import { isNonEmptyString } from '@sniptt/guards';
import { tipTapDocumentToMarkdown } from 'twenty-shared/utils';

import { aiChatComposerDraftsState } from '@/ai-chat/states/composer/aiChatComposerDraftsState';
import { aiChatAssistantProfileSelector } from '@/ai-chat/states/selectors/aiChatAssistantProfileSelector';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';

export const aiChatDraftPreviewTextFamilySelector = createAtomFamilySelector<
  string | null,
  string
>({
  key: 'aiChatDraftPreviewTextFamilySelector',
  get:
    (threadId: string) =>
    ({ get }) => {
      const serializedDraft = get(aiChatComposerDraftsState)[threadId];

      if (!isNonEmptyString(serializedDraft)) {
        return null;
      }

      const assistantProfile = get(aiChatAssistantProfileSelector);
      const text = getAgentChatPreviewPlainText({
        markdown: tipTapDocumentToMarkdown(serializedDraft),
        assistantDisplayName: assistantProfile.displayName,
      });

      return isNonEmptyString(text) ? text : null;
    },
});
