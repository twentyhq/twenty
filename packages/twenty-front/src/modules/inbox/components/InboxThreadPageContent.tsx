import { type ReactNode } from 'react';

import { AiChatThreadPageContent } from '@/ai-chat/instance/components/AiChatThreadPageContent';
import { aiChatThreadIsDirectMessageFamilySelector } from '@/ai-chat/threads/states/selectors/aiChatThreadIsDirectMessageFamilySelector';
import { InboxDirectMessageTitle } from '@/inbox/components/InboxDirectMessageTitle';
import { InboxThreadDetailsDropdown } from '@/inbox/components/InboxThreadDetailsDropdown';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';

type InboxThreadPageContentProps = {
  threadId: string;
  headerActions?: ReactNode;
  headerTitlePrefix?: ReactNode;
};

export const InboxThreadPageContent = ({
  threadId,
  headerActions,
  headerTitlePrefix,
}: InboxThreadPageContentProps) => {
  const isDirectMessage = useAtomFamilySelectorValue(
    aiChatThreadIsDirectMessageFamilySelector,
    threadId,
  );

  return (
    <AiChatThreadPageContent
      threadId={threadId}
      headerActions={headerActions}
      headerTitle={
        isDirectMessage ? (
          <InboxDirectMessageTitle threadId={threadId} />
        ) : undefined
      }
      headerTitlePrefix={headerTitlePrefix}
      headerTitleAccessory={<InboxThreadDetailsDropdown threadId={threadId} />}
    />
  );
};
