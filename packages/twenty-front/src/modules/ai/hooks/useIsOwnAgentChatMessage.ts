import { type ExtendedUIMessage } from 'twenty-shared/ai';
import { type Nullable } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { isInboxMessageOwn } from '@/ai/utils/isAgentChatMessageOwn';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useIsOwnInboxMessage = (
  message: Nullable<Pick<ExtendedUIMessage, 'role' | 'metadata'>>,
) => {
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);

  return (
    isDefined(message) &&
    isInboxMessageOwn({
      message,
      currentWorkspaceMemberId: currentWorkspaceMember?.id,
      isSenderlessUserMessageOwn: false,
    })
  );
};
