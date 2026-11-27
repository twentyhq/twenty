import { type ExtendedUIMessage } from 'twenty-shared/ai';
import { type Nullable } from 'twenty-shared/types';

import { aiChatThreadDisplayedMessagesFamilyState } from '@/ai-chat/states/display/aiChatThreadDisplayedMessagesFamilyState';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';

export const aiChatThreadMessageFamilySelector = createAtomFamilySelector<
  Nullable<ExtendedUIMessage>,
  { threadId: Nullable<string>; messageId: Nullable<string> }
>({
  key: 'aiChatThreadMessageFamilySelector',
  get:
    ({ threadId, messageId }) =>
    ({ get }) =>
      get(aiChatThreadDisplayedMessagesFamilyState, {
        threadId: threadId ?? null,
      }).find(({ id }) => id === messageId),
});
