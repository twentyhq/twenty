import { type ExtendedUIMessage } from 'twenty-shared/ai';

import { InboxMessageAuthorAvatar } from '@/ai/components/AiChatMessageAuthorAvatar';
import { InboxMessageAuthorResolver } from '@/ai/components/AiChatMessageAuthorResolver';
import { InboxMessageReceipt } from '@/ai/components/AiChatMessageReceipt';
import { inboxMessageAuthorLookupSelector } from '@/ai/states/selectors/agentChatMessageAuthorLookupSelector';
import { getInboxMessageAuthor } from '@/ai/utils/getAgentChatMessageAuthor';
import { ChatMessageHeader } from '@/chat/components/ChatMessageHeader';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

type InboxMessageAuthorHeaderProps = {
  messageId: string;
  role: ExtendedUIMessage['role'];
  metadata: ExtendedUIMessage['metadata'];
  createdAt: Date | string;
};

export const InboxMessageAuthorHeader = ({
  messageId,
  role,
  metadata,
  createdAt,
}: InboxMessageAuthorHeaderProps) => {
  const inboxMessageAuthorLookup = useAtomStateValue(
    inboxMessageAuthorLookupSelector,
  );
  const author = getInboxMessageAuthor({
    message: { id: messageId, role, metadata },
    authorLookup: inboxMessageAuthorLookup,
  });

  return (
    <InboxMessageAuthorResolver author={author}>
      {(resolvedAuthor) => (
        <ChatMessageHeader
          avatar={<InboxMessageAuthorAvatar author={resolvedAuthor} />}
          name={resolvedAuthor.name}
          createdAt={createdAt}
          receipt={<InboxMessageReceipt messageId={messageId} />}
        />
      )}
    </InboxMessageAuthorResolver>
  );
};
