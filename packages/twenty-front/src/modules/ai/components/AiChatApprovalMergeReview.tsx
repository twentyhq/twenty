import { useLingui } from '@lingui/react/macro';
import { IconArrowMerge } from 'twenty-ui/icon';

import { AiChatApprovalMergeReviewContent } from '@/ai/components/AiChatApprovalMergeReviewContent';
import { AiChatApprovalReviewDeck } from '@/ai/components/AiChatApprovalReviewDeck';
import { type AiChatApprovalMergePair } from '@/ai/types/AiChatApprovalMergePair';
import { type AiChatApprovalReviewCard } from '@/ai/types/AiChatApprovalReviewCard';

const MERGE_REVIEW_ICON_SIZE = 16;

type AiChatApprovalMergeReviewProps = {
  pairs: readonly AiChatApprovalMergePair[];
  activeIndex: number;
  onActiveIndexChange: (index: number) => void;
  onTabChange: (selection: {
    pairId: string;
    tab: AiChatApprovalMergePair['activeTab'];
  }) => void;
  onPriorityRecordChange: (selection: {
    pairId: string;
    priorityRecordId: string;
  }) => void;
  onRequestMerge: (pairIds: string[]) => void;
  onSkip: (pairId: string) => void;
  disabled?: boolean;
};

export const AiChatApprovalMergeReview = ({
  pairs,
  activeIndex,
  onActiveIndexChange,
  onTabChange,
  onPriorityRecordChange,
  onRequestMerge,
  onSkip,
  disabled = false,
}: AiChatApprovalMergeReviewProps) => {
  const { t } = useLingui();
  const cards: AiChatApprovalReviewCard[] = pairs.map((pair) => {
    const hasValidPriorityRecord = pair.sources.some(
      (source) => source.id === pair.priorityRecordId,
    );
    const isWaitingForPriorityRecord =
      pair.status === 'pending' && !hasValidPriorityRecord;

    return {
      id: pair.id,
      title: pair.title,
      icon: <IconArrowMerge size={MERGE_REVIEW_ICON_SIZE} />,
      approveLabel: t`Merge`,
      denyLabel: t`Skip`,
      hint: isWaitingForPriorityRecord
        ? t`Choose a source record to keep`
        : t`The priority record keeps its identity`,
      selectedCount: hasValidPriorityRecord ? pair.sources.length : 0,
      skippedCount: 0,
      status: pair.status,
      outcomeMessage: pair.outcomeMessage,
      progress: pair.progress,
      content: (
        <AiChatApprovalMergeReviewContent
          pair={pair}
          onTabChange={(tab) => onTabChange({ pairId: pair.id, tab })}
          onPriorityRecordChange={(priorityRecordId) =>
            onPriorityRecordChange({ pairId: pair.id, priorityRecordId })
          }
          disabled={disabled || pair.status !== 'pending'}
        />
      ),
    };
  });

  const mergeablePairIds = cards
    .filter(
      ({ status, selectedCount }) => status === 'pending' && selectedCount > 0,
    )
    .map(({ id }) => id);
  const mergeablePairCount = mergeablePairIds.length;

  return (
    <AiChatApprovalReviewDeck
      cards={cards}
      activeIndex={activeIndex}
      onActiveIndexChange={onActiveIndexChange}
      onRequestApproval={(pairIds) =>
        onRequestMerge(
          pairIds.filter((pairId) => mergeablePairIds.includes(pairId)),
        )
      }
      onDeny={onSkip}
      approveAllLabel={t`Merge all ${mergeablePairCount}`}
      previousLabel={t`Previous pair`}
      nextLabel={t`Next pair`}
      disabled={disabled}
    />
  );
};
