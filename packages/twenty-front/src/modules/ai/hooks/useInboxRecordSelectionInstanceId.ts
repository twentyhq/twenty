import { useId, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';

import { getInboxRecordSelectionScope } from '@/ai/utils/getInboxRecordSelectionScope';

export const useInboxRecordSelectionInstanceId = () => {
  const baseInstanceId = useId();
  const { threadId } = useParams();
  const { key: locationKey } = useLocation();
  const [selectionScope, setSelectionScope] = useState(() =>
    getInboxRecordSelectionScope({ threadId, locationKey }),
  );
  const nextSelectionScope = getInboxRecordSelectionScope({
    threadId,
    locationKey,
    previousScope: selectionScope,
  });

  if (nextSelectionScope !== selectionScope) {
    setSelectionScope(nextSelectionScope);
  }

  return `${baseInstanceId}-${nextSelectionScope.generation}`;
};
