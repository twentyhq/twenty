import { type ExtendedUIMessage } from 'twenty-shared/ai';

import { AiChatMessageAuthorAvatar } from '@/ai/components/AiChatMessageAuthorAvatar';
import { AiChatMessageAuthorResolver } from '@/ai/components/AiChatMessageAuthorResolver';
import { AiChatMessageReceipt } from '@/ai/components/AiChatMessageReceipt';
import { aiChatMessageAuthorLookupSelector } from '@/ai/states/selectors/aiChatMessageAuthorLookupSelector';
import { getAiChatMessageAuthor } from '@/ai/utils/getAiChatMessageAuthor';
import { ChatMessageHeader } from '@/chat/components/ChatMessageHeader';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

type AiChatMessageAuthorHeaderProps = {
  messageId: string;
  role: ExtendedUIMessage['role'];
  metadata: ExtendedUIMessage['metadata'];
  createdAt: Date | string;
};

export const AiChatMessageAuthorHeader = ({
  messageId,
  role,
  metadata,
  createdAt,
}: AiChatMessageAuthorHeaderProps) => {
  const aiChatMessageAuthorLookup = useAtomStateValue(
    aiChatMessageAuthorLookupSelector,
  );
  const author = getAiChatMessageAuthor({
    message: { id: messageId, role, metadata },
    authorLookup: aiChatMessageAuthorLookup,
  });

  return (
    <AiChatMessageAuthorResolver author={author}>
      {(resolvedAuthor) => (
        <ChatMessageHeader
          avatar={<AiChatMessageAuthorAvatar author={resolvedAuthor} />}
          name={resolvedAuthor.name}
          createdAt={createdAt}
          receipt={<AiChatMessageReceipt messageId={messageId} />}
        />
      )}
    </AiChatMessageAuthorResolver>
  );
};
