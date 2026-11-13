import { isNonEmptyString } from '@sniptt/guards';
import { tipTapDocumentToMarkdown } from 'twenty-shared/utils';

import { aiChatDraftsByThreadIdState } from '@/ai/states/aiChatDraftsByThreadIdState';
import { aiChatAssistantProfileSelector } from '@/ai/states/selectors/aiChatAssistantProfileSelector';
import { getAiChatPreviewPlainText } from '@/ai/utils/getAiChatPreviewPlainText';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';

export const aiChatDraftPreviewTextFamilySelector = createAtomFamilySelector<
  string | null,
  string
>({
  key: 'aiChatDraftPreviewTextFamilySelector',
  get:
    (threadId: string) =>
    ({ get }) => {
      const serializedDraft = get(aiChatDraftsByThreadIdState)[threadId];

      if (!isNonEmptyString(serializedDraft)) {
        return null;
      }

      const assistantProfile = get(aiChatAssistantProfileSelector);
      const text = getAiChatPreviewPlainText({
        markdown: tipTapDocumentToMarkdown(serializedDraft),
        assistantDisplayName: assistantProfile.displayName,
      });

      return isNonEmptyString(text) ? text : null;
    },
});
