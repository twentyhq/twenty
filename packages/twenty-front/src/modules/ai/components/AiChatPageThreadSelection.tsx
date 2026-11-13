import { useLocation, useParams } from 'react-router-dom';

import { AiChatPageThreadUrlSyncEffect } from '@/ai/components/AiChatPageThreadUrlSyncEffect';
import { AI_CHAT_NEW_THREAD_PATH_SEGMENT } from '@/ai/constants/AiChatNewThreadPathSegment';

export const AiChatPageThreadSelection = () => {
  const { key } = useLocation();
  const { threadId } = useParams();
  const threadSelectionKey =
    threadId === AI_CHAT_NEW_THREAD_PATH_SEGMENT ? key : threadId;

  return <AiChatPageThreadUrlSyncEffect key={threadSelectionKey} />;
};
