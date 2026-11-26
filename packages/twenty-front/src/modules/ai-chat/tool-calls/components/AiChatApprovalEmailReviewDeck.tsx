import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';

import { AiChatApprovalReviewDeck } from '@/ai-chat/tool-calls/components/AiChatApprovalReviewDeck';
import { useAiChatEmailApprovalCards } from '@/ai-chat/tool-calls/hooks/useAiChatEmailApprovalCards';
import { type AiChatPendingEmailApproval } from '@/ai-chat/tool-calls/types/AiChatPendingEmailApproval';

type AiChatApprovalEmailReviewDeckProps = {
  emailApprovals: AiChatPendingEmailApproval[];
  answeringToolCallIds: string[];
  onAnsweringToolCallIdsChange: (toolCallIds: string[]) => void;
};

export const AiChatApprovalEmailReviewDeck = ({
  emailApprovals,
  answeringToolCallIds,
  onAnsweringToolCallIdsChange,
}: AiChatApprovalEmailReviewDeckProps) => {
  const { t } = useLingui();
  const [activeIndex, setActiveIndex] = useState(0);
  const { cards, approveCards, denyCard, isAnswering } =
    useAiChatEmailApprovalCards({
      emailApprovals,
      answeringToolCallIds,
      onAnsweringToolCallIdsChange,
      onCardAnswered: (answeredCardId) => {
        const nextPendingIndex = cards.findIndex(
          (card, index) =>
            index > activeIndex &&
            card.id !== answeredCardId &&
            card.status === 'pending',
        );

        if (nextPendingIndex >= 0) {
          setActiveIndex(nextPendingIndex);
        }
      },
    });

  return (
    <AiChatApprovalReviewDeck
      cards={cards}
      activeIndex={Math.min(activeIndex, cards.length - 1)}
      onActiveIndexChange={setActiveIndex}
      onRequestApproval={(cardIds) => void approveCards(cardIds)}
      onDeny={(cardId) => void denyCard(cardId)}
      getApproveAllLabel={(pendingCardCount) => t`Send all ${pendingCardCount}`}
      previousLabel={t`Previous draft`}
      nextLabel={t`Next draft`}
      disabled={isAnswering}
    />
  );
};
