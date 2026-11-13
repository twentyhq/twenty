import { type ExtendedUIMessage } from 'twenty-shared/ai';
import { type Nullable } from 'twenty-shared/types';

import { aiChatMessagesFamilyState } from '@/ai/states/agentChatMessagesFamilyState';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';

export const aiChatThreadMessageFamilySelector = createAtomFamilySelector<
  Nullable<ExtendedUIMessage>,
  { threadId: Nullable<string>; messageId: Nullable<string> }
>({
  key: 'aiChatThreadMessageFamilySelector',
  get:
    ({ threadId, messageId }) =>
    ({ get }) =>
      get(aiChatMessagesFamilyState, { threadId: threadId ?? null }).find(
        ({ id }) => id === messageId,
      ),
});
