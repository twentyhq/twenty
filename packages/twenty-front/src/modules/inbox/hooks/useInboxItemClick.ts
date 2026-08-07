import { isDefined } from 'twenty-shared/utils';

import { useOpenAskAiThread } from '@/ai/hooks/useOpenAskAiThread';
import { useInboxItemActions } from '@/inbox/hooks/useInboxItemActions';
import { selectedInboxItemIdState } from '@/inbox/states/selectedInboxItemIdState';
import { useOpenAskAiPageInSidePanel } from '@/side-panel/hooks/useOpenAskAiPageInSidePanel';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { type InboxItem } from '~/generated/graphql';

export const useInboxItemClick = () => {
  const { markInboxItemRead } = useInboxItemActions();
  const { openAskAiThread } = useOpenAskAiThread();
  const { openAskAiPage } = useOpenAskAiPageInSidePanel();
  const setSelectedInboxItemId = useSetAtomState(selectedInboxItemIdState);

  const handleInboxItemClick = (inboxItem: InboxItem) => {
    if (!isDefined(inboxItem.readAt)) {
      void markInboxItemRead(inboxItem.id);
    }

    if (isDefined(inboxItem.threadId)) {
      setSelectedInboxItemId(null);
      openAskAiThread(inboxItem.threadId);

      return;
    }

    setSelectedInboxItemId(inboxItem.id);
    openAskAiPage({ resetNavigationStack: true });
  };

  return { handleInboxItemClick };
};
