import { useId, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';

import { getAiChatInboxRecordSelectionScope } from '@/ai/utils/getAiChatInboxRecordSelectionScope';

export const useAiChatInboxRecordSelectionInstanceId = () => {
  const baseInstanceId = useId();
  const { threadId } = useParams();
  const { key: locationKey } = useLocation();
  const [selectionScope, setSelectionScope] = useState(() =>
    getAiChatInboxRecordSelectionScope({ threadId, locationKey }),
  );
  const nextSelectionScope = getAiChatInboxRecordSelectionScope({
    threadId,
    locationKey,
    previousScope: selectionScope,
  });

  if (nextSelectionScope !== selectionScope) {
    setSelectionScope(nextSelectionScope);
  }

  return `${baseInstanceId}-${nextSelectionScope.generation}`;
};
