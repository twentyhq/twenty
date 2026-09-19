import { useAtomValue } from 'jotai';
import { isDefined } from 'twenty-shared/utils';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { type FlatAgentChatThread } from '@/metadata-store/types/FlatAgentChatThread';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useIsCurrentUserAiChatThreadOwner = (threadId: string) => {
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const threadsStoreEntry = useAtomValue(
    metadataStoreState.atomFamily('agentChatThreads'),
  );
  const thread = (threadsStoreEntry.current as FlatAgentChatThread[]).find(
    (candidate) => candidate.id === threadId,
  );

  const isKnown =
    isDefined(thread) && isDefined(currentWorkspaceMember?.userWorkspaceId);

  return {
    isKnown,
    isOwner:
      isKnown &&
      thread.ownerUserWorkspaceId === currentWorkspaceMember?.userWorkspaceId,
  };
};
