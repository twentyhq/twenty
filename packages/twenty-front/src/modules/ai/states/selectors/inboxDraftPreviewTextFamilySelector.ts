import { isNonEmptyString } from '@sniptt/guards';
import { tipTapDocumentToMarkdown } from 'twenty-shared/utils';

import { inboxDraftsByThreadIdState } from '@/ai/states/inboxDraftsByThreadIdState';
import { aiChatAssistantProfileSelector } from '@/ai/states/selectors/aiChatAssistantProfileSelector';
import { getInboxPreviewPlainText } from '@/ai/utils/getInboxPreviewPlainText';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';

export const inboxDraftPreviewTextFamilySelector = createAtomFamilySelector<
  string | null,
  string
>({
  key: 'inboxDraftPreviewTextFamilySelector',
  get:
    (threadId: string) =>
    ({ get }) => {
      const serializedDraft = get(inboxDraftsByThreadIdState)[threadId];

      if (!isNonEmptyString(serializedDraft)) {
        return null;
      }

      const assistantProfile = get(aiChatAssistantProfileSelector);
      const text = getInboxPreviewPlainText({
        markdown: tipTapDocumentToMarkdown(serializedDraft),
        assistantDisplayName: assistantProfile.displayName,
      });

      return isNonEmptyString(text) ? text : null;
    },
});
