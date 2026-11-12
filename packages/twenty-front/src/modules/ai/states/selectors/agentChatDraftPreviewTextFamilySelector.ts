import { isNonEmptyString } from '@sniptt/guards';
import { tipTapDocumentToMarkdown } from 'twenty-shared/utils';

import { agentChatDraftsByThreadIdState } from '@/ai/states/agentChatDraftsByThreadIdState';
import { aiChatAssistantProfileSelector } from '@/ai/states/selectors/aiChatAssistantProfileSelector';
import { getAgentChatPreviewPlainText } from '@/ai/utils/getAgentChatPreviewPlainText';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';

export const agentChatDraftPreviewTextFamilySelector = createAtomFamilySelector<
  string | null,
  string
>({
  key: 'agentChatDraftPreviewTextFamilySelector',
  get:
    (threadId: string) =>
    ({ get }) => {
      const serializedDraft = get(agentChatDraftsByThreadIdState)[threadId];

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
