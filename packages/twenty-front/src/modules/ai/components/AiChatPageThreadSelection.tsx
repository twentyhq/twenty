import { useParams } from 'react-router-dom';

import { AiChatNewThreadSelectionEffect } from '@/ai/components/AiChatNewThreadSelectionEffect';
import { AiChatPageThreadUrlSyncEffect } from '@/ai/components/AiChatPageThreadUrlSyncEffect';
import { AI_CHAT_NEW_THREAD_PATH_SEGMENT } from '@/ai/constants/AiChatNewThreadPathSegment';

export const AiChatPageThreadSelection = () => {
  const { threadId } = useParams();

  return threadId === AI_CHAT_NEW_THREAD_PATH_SEGMENT ? (
    <AiChatNewThreadSelectionEffect />
  ) : (
    <AiChatPageThreadUrlSyncEffect />
  );
};
