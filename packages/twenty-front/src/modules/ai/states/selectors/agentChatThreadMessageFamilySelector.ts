import { type ExtendedUIMessage } from 'twenty-shared/ai';
import { type Nullable } from 'twenty-shared/types';

import { agentChatMessagesFamilyState } from '@/ai/states/agentChatMessagesFamilyState';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';

export const agentChatThreadMessageFamilySelector = createAtomFamilySelector<
  Nullable<ExtendedUIMessage>,
  { threadId: Nullable<string>; messageId: Nullable<string> }
>({
  key: 'agentChatThreadMessageFamilySelector',
  get:
    ({ threadId, messageId }) =>
    ({ get }) =>
      get(agentChatMessagesFamilyState, { threadId: threadId ?? null }).find(
        ({ id }) => id === messageId,
      ),
});
