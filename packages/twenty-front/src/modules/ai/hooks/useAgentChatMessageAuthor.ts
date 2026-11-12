import { type ExtendedUIMessage } from 'twenty-shared/ai';
import { type Nullable } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { agentChatMessageAuthorContextSelector } from '@/ai/states/selectors/agentChatMessageAuthorContextSelector';
import { getAgentChatMessageAuthor } from '@/ai/utils/getAgentChatMessageAuthor';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useAgentChatMessageAuthor = (
  message: Nullable<Pick<ExtendedUIMessage, 'id' | 'role' | 'metadata'>>,
) => {
  const agentChatMessageAuthorContext = useAtomStateValue(
    agentChatMessageAuthorContextSelector,
  );

  return isDefined(message)
    ? getAgentChatMessageAuthor({
        message,
        authorContext: agentChatMessageAuthorContext,
      })
    : null;
};
