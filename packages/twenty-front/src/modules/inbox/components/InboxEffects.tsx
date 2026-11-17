import { isDefined } from 'twenty-shared/utils';

import { useAiChatPageThreadId } from '@/ai/hooks/useAiChatPageThreadId';
import { InboxChannelsEffect } from '@/inbox/components/InboxChannelsEffect';
import { InboxRecentThreadListSyncEffect } from '@/inbox/components/InboxRecentThreadListSyncEffect';
import { InboxThreadInitializationEffect } from '@/inbox/components/InboxThreadInitializationEffect';
import { InboxThreadRecordOperationsEffect } from '@/inbox/components/InboxThreadRecordOperationsEffect';

export const InboxEffects = () => {
  const aiChatPageThreadId = useAiChatPageThreadId();

  return (
    <>
      <InboxThreadInitializationEffect />
      <InboxThreadRecordOperationsEffect />
      <InboxChannelsEffect />
      {isDefined(aiChatPageThreadId) && (
        <InboxRecentThreadListSyncEffect threadId={aiChatPageThreadId} />
      )}
    </>
  );
};
