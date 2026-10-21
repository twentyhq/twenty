import { useId, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';

import { AI_CHAT_NEW_THREAD_PATH_SEGMENT } from '@/ai/constants/AiChatNewThreadPathSegment';

export const useAiChatInboxRecordSelectionInstanceId = () => {
  const baseInstanceId = useId();
  const { threadId } = useParams();
  const { key: locationKey } = useLocation();
  const newThreadEntryKey =
    threadId === AI_CHAT_NEW_THREAD_PATH_SEGMENT ? locationKey : null;
  const [selectionScope, setSelectionScope] = useState({
    newThreadEntryKey,
    generation: 0,
  });

  if (selectionScope.newThreadEntryKey !== newThreadEntryKey) {
    setSelectionScope({
      newThreadEntryKey,
      generation: selectionScope.generation + 1,
    });
  }

  return `${baseInstanceId}-${selectionScope.generation}`;
};
