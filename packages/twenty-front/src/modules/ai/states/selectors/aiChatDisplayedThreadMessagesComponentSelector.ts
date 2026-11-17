import { type ExtendedUIMessage } from 'twenty-shared/ai';

import { aiChatDisplayedThreadComponentState } from '@/ai/states/aiChatDisplayedThreadComponentState';
import { aiChatMessagesFamilyState } from '@/ai/states/aiChatMessagesFamilyState';
import { AiChatInstanceContext } from '@/ai/states/contexts/AiChatInstanceContext';
import { createAtomComponentSelector } from '@/ui/utilities/state/jotai/utils/createAtomComponentSelector';

export const aiChatDisplayedThreadMessagesComponentSelector =
  createAtomComponentSelector<ExtendedUIMessage[]>({
    key: 'aiChatDisplayedThreadMessagesComponentSelector',
    componentInstanceContext: AiChatInstanceContext,
    get:
      ({ instanceId }) =>
      ({ get }) =>
        get(aiChatMessagesFamilyState, {
          threadId: get(aiChatDisplayedThreadComponentState, { instanceId }),
        }),
  });
