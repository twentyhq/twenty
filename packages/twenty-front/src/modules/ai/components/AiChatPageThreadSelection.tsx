import { useLocation, useParams } from 'react-router-dom';

import { InboxThreadPageThreadUrlSyncEffect } from '@/ai/components/AiChatPageThreadUrlSyncEffect';
import { INBOX_NEW_THREAD_PATH_SEGMENT } from '@/ai/constants/AiChatNewThreadPathSegment';

export const InboxThreadPageThreadSelection = () => {
  const { key } = useLocation();
  const { threadId } = useParams();
  const threadSelectionKey =
    threadId === INBOX_NEW_THREAD_PATH_SEGMENT ? key : threadId;

  return <InboxThreadPageThreadUrlSyncEffect key={threadSelectionKey} />;
};
