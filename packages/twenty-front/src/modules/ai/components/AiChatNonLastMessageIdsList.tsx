import { AiChatMessage } from '@/ai/components/AiChatMessage';
import { agentChatNonLastMessageIdsComponentSelector } from '@/ai/states/selectors/agentChatNonLastMessageIdsComponentSelector';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { styled } from '@linaria/react';

// Settled messages never change, so let the browser skip layout and paint for
// the ones scrolled out of view. `auto` in contain-intrinsic-size keeps the
// last rendered height once a message has been painted; the estimate only
// applies to never-painted messages, where scroll anchoring absorbs the
// correction. 160px approximates a typical assistant message so the scrollbar
// stays close to truth on long resumed threads.
const StyledSettledMessage = styled.div`
  contain-intrinsic-size: auto 160px;
  content-visibility: auto;
`;

export const AiChatNonLastMessageIdsList = () => {
  const agentChatNonLastMessageIds = useAtomComponentSelectorValue(
    agentChatNonLastMessageIdsComponentSelector,
  );

  return agentChatNonLastMessageIds.map((messageId) => (
    <StyledSettledMessage key={messageId}>
      <AiChatMessage messageId={messageId} />
    </StyledSettledMessage>
  ));
};
