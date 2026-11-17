import { isNonEmptyArray } from '@sniptt/guards';

import { AiChatInstanceContext } from '@/ai/states/contexts/AiChatInstanceContext';
import { aiChatDisplayedThreadMessagesComponentSelector } from '@/ai/states/selectors/aiChatDisplayedThreadMessagesComponentSelector';
import { createAtomComponentSelector } from '@/ui/utilities/state/jotai/utils/createAtomComponentSelector';

export const aiChatHasMessageComponentSelector =
  createAtomComponentSelector<boolean>({
    key: 'aiChatHasMessageComponentSelector',
    componentInstanceContext: AiChatInstanceContext,
    get:
      ({ instanceId }) =>
      ({ get }) =>
        isNonEmptyArray(
          get(aiChatDisplayedThreadMessagesComponentSelector, { instanceId }),
        ),
  });
