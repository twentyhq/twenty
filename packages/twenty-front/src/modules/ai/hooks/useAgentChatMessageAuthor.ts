import { type ExtendedUIMessage } from 'twenty-shared/ai';
import { type Nullable } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { aiChatMessageAuthorLookupSelector } from '@/ai/states/selectors/agentChatMessageAuthorLookupSelector';
import { getAiChatMessageAuthor } from '@/ai/utils/getAgentChatMessageAuthor';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useAiChatMessageAuthor = (
  message: Nullable<Pick<ExtendedUIMessage, 'id' | 'role' | 'metadata'>>,
) => {
  const aiChatMessageAuthorLookup = useAtomStateValue(
    aiChatMessageAuthorLookupSelector,
  );

  return isDefined(message)
    ? getAiChatMessageAuthor({
        message,
        authorLookup: aiChatMessageAuthorLookup,
      })
    : null;
};
