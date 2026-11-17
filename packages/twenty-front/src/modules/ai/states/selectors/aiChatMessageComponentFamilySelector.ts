import { type ExtendedUIMessage } from 'twenty-shared/ai';
import { type Nullable } from 'twenty-shared/types';

import { AiChatInstanceContext } from '@/ai/states/contexts/AiChatInstanceContext';
import { aiChatDisplayedThreadMessagesComponentSelector } from '@/ai/states/selectors/aiChatDisplayedThreadMessagesComponentSelector';
import { createAtomComponentFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomComponentFamilySelector';

export const aiChatMessageComponentFamilySelector =
  createAtomComponentFamilySelector<
    Nullable<ExtendedUIMessage>,
    { messageId: Nullable<string> }
  >({
    key: 'aiChatMessageComponentFamilySelector',
    componentInstanceContext: AiChatInstanceContext,
    get:
      ({ instanceId, familyKey: { messageId } }) =>
      ({ get }) =>
        get(aiChatDisplayedThreadMessagesComponentSelector, {
          instanceId,
        }).find((message) => message.id === messageId),
  });
