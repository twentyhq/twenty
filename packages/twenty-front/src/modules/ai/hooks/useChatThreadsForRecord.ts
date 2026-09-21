import { useQuery } from '@apollo/client/react';

import { GET_CHAT_THREADS_FOR_RECORD } from '@/ai/graphql/queries/getChatThreadsForRecord';
import { type TargetRecordIdentifier } from '@/ui/layout/contexts/TargetRecordIdentifier';
import { type GetChatThreadsForRecordQuery } from '~/generated-metadata/graphql';

const EMPTY_THREADS: GetChatThreadsForRecordQuery['chatThreadsForRecord'] = [];

export const useChatThreadsForRecord = ({
  id,
  targetObjectNameSingular,
}: TargetRecordIdentifier) => {
  const { data, loading, error } = useQuery<GetChatThreadsForRecordQuery>(
    GET_CHAT_THREADS_FOR_RECORD,
    {
      variables: {
        objectNameSingular: targetObjectNameSingular,
        recordId: id,
      },
    },
  );

  return {
    threads: data?.chatThreadsForRecord ?? EMPTY_THREADS,
    loading,
    error,
  };
};
