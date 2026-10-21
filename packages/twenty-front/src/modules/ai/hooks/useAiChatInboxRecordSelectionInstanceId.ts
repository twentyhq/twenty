import { useId, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';

import { AI_CHAT_NEW_THREAD_PATH_SEGMENT } from '@/ai/constants/AiChatNewThreadPathSegment';

export const useAiChatInboxRecordSelectionInstanceId = () => {
  const baseInstanceId = useId();
  const { threadId } = useParams();
  const { key: locationKey } = useLocation();
  const routeSelectionKey =
    threadId === AI_CHAT_NEW_THREAD_PATH_SEGMENT ? locationKey : threadId;
  const [selectionScope, setSelectionScope] = useState({
    routeSelectionKey,
    generation: 0,
  });

  if (selectionScope.routeSelectionKey !== routeSelectionKey) {
    setSelectionScope({
      routeSelectionKey,
      generation: selectionScope.generation + 1,
    });
  }

  return `${baseInstanceId}-${selectionScope.generation}`;
};
