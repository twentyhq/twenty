import { type ExtendedUIMessage } from 'twenty-shared/ai';

import { InboxMessageAuthorAvatar } from '@/ai/components/InboxMessageAuthorAvatar';
import { InboxMessageAuthorResolver } from '@/ai/components/InboxMessageAuthorResolver';
import { InboxMessageReceipt } from '@/ai/components/InboxMessageReceipt';
import { inboxMessageAuthorLookupSelector } from '@/ai/states/selectors/inboxMessageAuthorLookupSelector';
import { getInboxMessageAuthor } from '@/ai/utils/getInboxMessageAuthor';
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
