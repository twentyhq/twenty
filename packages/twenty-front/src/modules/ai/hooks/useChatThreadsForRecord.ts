import { useQuery } from '@apollo/client/react';

import { type TargetRecordIdentifier } from '@/ui/layout/contexts/TargetRecordIdentifier';
import {
  GetChatThreadsForRecordDocument,
  type GetChatThreadsForRecordQuery,
} from '~/generated-metadata/graphql';

const EMPTY_THREADS: GetChatThreadsForRecordQuery['chatThreadsForRecord'] = [];

// The widget shows the most recent conversations in a card rather than a
// browsable list, so it asks for one page and never pages further.
const CHAT_THREADS_FOR_RECORD_PAGE_SIZE = 20;

export const useChatThreadsForRecord = ({
  id,
  targetObjectNameSingular,
}: TargetRecordIdentifier) => {
  const { data, loading, error, refetch } = useQuery(
    GetChatThreadsForRecordDocument,
    {
      variables: {
        objectNameSingular: targetObjectNameSingular,
        recordId: id,
        limit: CHAT_THREADS_FOR_RECORD_PAGE_SIZE,
      },
    },
  );

  return {
    threads: data?.chatThreadsForRecord ?? EMPTY_THREADS,
    loading,
    error,
    refetch,
  };
};
