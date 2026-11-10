import { isDefined } from 'twenty-shared/utils';
import { Avatar } from 'twenty-ui/primitives/data-display';

import { AiChatComposerQuotePreview } from '@/ai/components/AiChatComposerQuotePreview';
import { agentChatQuotedMessageIdFamilyState } from '@/ai/states/agentChatQuotedMessageIdFamilyState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { agentChatMessageFamilySelector } from '@/ai/states/selectors/agentChatMessageFamilySelector';
import { getAgentChatMessageQuoteExcerpt } from '@/ai/utils/getAgentChatMessageQuoteExcerpt';
import { getAgentChatSenderLabel } from '@/ai/utils/getAgentChatSenderLabel';
import { scrollToAgentChatMessage } from '@/ai/utils/scrollToAgentChatMessage';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

export const AiChatComposerQuote = () => {
  const currentAiChatThread = useAtomStateValue(currentAiChatThreadState);
  const currentWorkspaceMembers = useAtomStateValue(
    currentWorkspaceMembersState,
  );
  const [agentChatQuotedMessageId, setAgentChatQuotedMessageId] =
    useAtomFamilyState(agentChatQuotedMessageIdFamilyState, {
      threadId: currentAiChatThread,
    });
  const quotedMessage = useAtomFamilySelectorValue(
    agentChatMessageFamilySelector,
    { messageId: agentChatQuotedMessageId },
  );

  if (!isDefined(agentChatQuotedMessageId)) {
    return null;
  }

  const sender = currentWorkspaceMembers.find(
    ({ id }) => id === quotedMessage?.metadata?.senderWorkspaceMemberId,
  );
  const authorName = getAgentChatSenderLabel({
    sender,
    isCurrentWorkspaceMember: false,
  });

  return (
    <AiChatComposerQuotePreview
      source={
        isDefined(quotedMessage)
          ? {
              status: 'available',
              messageId: quotedMessage.id,
              authorName,
              authorAvatar: (
                <Avatar
                  name={authorName}
                  colorSeed={sender?.id}
                  src={getAbsoluteImageUrl(sender?.avatarUrl)}
                  size="sm"
                  shape="circle"
                />
              ),
              excerpt: getAgentChatMessageQuoteExcerpt(quotedMessage),
            }
          : { status: 'unavailable' }
      }
      onRemove={() => setAgentChatQuotedMessageId(null)}
      onNavigateToMessage={scrollToAgentChatMessage}
    />
  );
};
