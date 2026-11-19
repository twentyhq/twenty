import { StandardObjectNameSingular } from 'twenty-shared/types';

import { useApplyAiChatThreadUpdate } from '@/ai-chat/threads/hooks/useApplyAiChatThreadUpdate';
import { type AiChatThreadRecord } from '@/ai-chat/threads/types/AiChatThreadRecord';
import { useLazyFindOneRecord } from '@/object-record/hooks/useLazyFindOneRecord';

export const useRefreshAiChatThreadImageFile = () => {
  const { applyAiChatThreadUpdate } = useApplyAiChatThreadUpdate();
  const { findOneRecord } = useLazyFindOneRecord<AiChatThreadRecord>({
    objectNameSingular: StandardObjectNameSingular.AgentChatThread,
    recordGqlFields: { id: true, imageFile: true },
    fetchPolicy: 'network-only',
  });

  const refreshAiChatThreadImageFile = (threadId: string) =>
    findOneRecord({
      objectRecordId: threadId,
      onCompleted: ({ id, imageFile }) =>
        applyAiChatThreadUpdate({ id, imageFile }),
    });

  return { refreshAiChatThreadImageFile };
};
