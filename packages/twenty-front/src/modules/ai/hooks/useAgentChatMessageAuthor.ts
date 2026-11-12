import { type ExtendedUIMessage } from 'twenty-shared/ai';
import { type Nullable } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { agentChatMessageAuthorLookupSelector } from '@/ai/states/selectors/agentChatMessageAuthorLookupSelector';
import { getAgentChatMessageAuthor } from '@/ai/utils/getAgentChatMessageAuthor';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useAgentChatMessageAuthor = (
  message: Nullable<Pick<ExtendedUIMessage, 'id' | 'role' | 'metadata'>>,
) => {
  const agentChatMessageAuthorLookup = useAtomStateValue(
    agentChatMessageAuthorLookupSelector,
  );

  return isDefined(message)
    ? getAgentChatMessageAuthor({
        message,
        authorLookup: agentChatMessageAuthorLookup,
      })
    : null;
};
