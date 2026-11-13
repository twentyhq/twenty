import { type ExtendedUIMessage } from 'twenty-shared/ai';
import { type Nullable } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { isAiChatMessageOwn } from '@/ai/utils/isAiChatMessageOwn';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useIsOwnAiChatMessage = (
  message: Nullable<Pick<ExtendedUIMessage, 'role' | 'metadata'>>,
) => {
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);

  return (
    isDefined(message) &&
    isAiChatMessageOwn({
      message,
      currentWorkspaceMemberId: currentWorkspaceMember?.id,
      isSenderlessUserMessageOwn: false,
    })
  );
};
