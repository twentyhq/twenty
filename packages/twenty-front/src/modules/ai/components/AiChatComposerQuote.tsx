import { isDefined } from 'twenty-shared/utils';
import { Avatar } from 'twenty-ui/primitives/data-display';

import { AiChatComposerQuotePreview } from '@/ai/components/AiChatComposerQuotePreview';
import { agentChatDisplayedThreadState } from '@/ai/states/agentChatDisplayedThreadState';
import { agentChatQuotedMessageIdFamilyState } from '@/ai/states/agentChatQuotedMessageIdFamilyState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { agentChatMessageQuoteSourceFamilySelector } from '@/ai/states/selectors/agentChatMessageQuoteSourceFamilySelector';
import { scrollToAgentChatMessage } from '@/ai/utils/scrollToAgentChatMessage';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

export const AiChatComposerQuote = () => {
  const currentAiChatThread = useAtomStateValue(currentAiChatThreadState);
  const agentChatDisplayedThread = useAtomStateValue(
    agentChatDisplayedThreadState,
  );
  const [agentChatQuotedMessageId, setAgentChatQuotedMessageId] =
    useAtomFamilyState(agentChatQuotedMessageIdFamilyState, {
      threadId: currentAiChatThread,
    });
  const quotedMessageSource = useAtomFamilySelectorValue(
    agentChatMessageQuoteSourceFamilySelector,
    { threadId: agentChatDisplayedThread, messageId: agentChatQuotedMessageId },
  );

  if (!isDefined(agentChatQuotedMessageId)) {
    return null;
  }

  const removeQuote = () => setAgentChatQuotedMessageId(null);

  if (!isDefined(quotedMessageSource)) {
    return (
      <AiChatComposerQuotePreview
        source={{ status: 'unavailable' }}
        onRemove={removeQuote}
        onNavigateToMessage={scrollToAgentChatMessage}
      />
    );
  }

  const { messageId, sender, authorName, excerpt } = quotedMessageSource;

  return (
    <AiChatComposerQuotePreview
      source={{
        status: 'available',
        messageId,
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
        excerpt,
      }}
      onRemove={removeQuote}
      onNavigateToMessage={scrollToAgentChatMessage}
    />
  );
};
