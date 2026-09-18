import { useAtomValue } from 'jotai';

import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { type FlatAgentChatThread } from '@/metadata-store/types/FlatAgentChatThread';

export const useAiChatThreadById = (
  threadId: string | null | undefined,
): FlatAgentChatThread | undefined => {
  const threadsStoreEntry = useAtomValue(
    metadataStoreState.atomFamily('agentChatThreads'),
  );

  return (threadsStoreEntry.current as FlatAgentChatThread[]).find(
    (candidate) => candidate.id === threadId,
  );
};
