import { useAiChatPageThreadId } from '@/ai-chat/hooks/useAiChatPageThreadId';
import { useLoadInboxThreadsOnStart } from '@/inbox/hooks/useLoadInboxThreadsOnStart';
import { useSyncInboxChannels } from '@/inbox/hooks/useSyncInboxChannels';
import { useSyncInboxRecentThreadList } from '@/inbox/hooks/useSyncInboxRecentThreadList';
import { useSyncInboxThreadRecords } from '@/inbox/hooks/useSyncInboxThreadRecords';

export const InboxSyncEffect = () => {
  const aiChatPageThreadId = useAiChatPageThreadId();

  useLoadInboxThreadsOnStart();
  useSyncInboxThreadRecords();
  useSyncInboxChannels();
  useSyncInboxRecentThreadList(aiChatPageThreadId);

  return null;
};
