import { aiChatDraftsByThreadIdState } from '@/ai-chat/states/aiChatDraftsByThreadIdState';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';

export const aiChatDraftFamilySelector = createAtomFamilySelector<
  string,
  string
>({
  key: 'aiChatDraftFamilySelector',
  get:
    (threadId) =>
    ({ get }) =>
      get(aiChatDraftsByThreadIdState)[threadId] ?? '',
});
