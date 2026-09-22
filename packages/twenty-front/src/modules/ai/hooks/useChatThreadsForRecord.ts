import { useQuery } from '@apollo/client/react';

import { GET_CHAT_THREADS_FOR_RECORD } from '@/ai/graphql/queries/getChatThreadsForRecord';
import { type TargetRecordIdentifier } from '@/ui/layout/contexts/TargetRecordIdentifier';
import { type GetChatThreadsForRecordQuery } from '~/generated-metadata/graphql';

const EMPTY_THREADS: GetChatThreadsForRecordQuery['chatThreadsForRecord'] = [];

// The widget shows the most recent conversations in a card rather than a
// browsable list, so it asks for one page and never pages further.
export const CHAT_THREADS_FOR_RECORD_PAGE_SIZE = 20;

export const useChatThreadsForRecord = ({
  id,
  targetObjectNameSingular,
}: TargetRecordIdentifier) => {
  const { data, loading, error, refetch } =
    useQuery<GetChatThreadsForRecordQuery>(GET_CHAT_THREADS_FOR_RECORD, {
      variables: {
        objectNameSingular: targetObjectNameSingular,
        recordId: id,
        limit: CHAT_THREADS_FOR_RECORD_PAGE_SIZE,
      },
    });

  return {
    threads: data?.chatThreadsForRecord ?? EMPTY_THREADS,
    loading,
    error,
    refetch,
  };
};
