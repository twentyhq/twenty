import { useLingui } from '@lingui/react/macro';
import { useStore } from 'jotai';
import { useState } from 'react';
import { type ToolCallApprovalResponse } from 'twenty-shared/ai';
import { useIcons } from 'twenty-ui/icon/provider';
import { useTheme } from 'twenty-ui/theme';

import { AiChatApprovalReviewDeck } from '@/ai/components/AiChatApprovalReviewDeck';
import { AiChatRecordApprovalReview } from '@/ai/components/AiChatRecordApprovalReview';
import { useAnswerAgentChatToolCall } from '@/ai/hooks/useAnswerAgentChatToolCall';
import { agentChatDisplayedThreadState } from '@/ai/states/agentChatDisplayedThreadState';
import { type AgentChatPendingRecordApproval } from '@/ai/types/AgentChatPendingRecordApproval';
import { getAgentChatRecordApprovalGroupId } from '@/ai/utils/getAgentChatRecordApprovalGroupId';
import { buildRejectedToolCallOutput } from '@/ai/utils/buildRejectedToolCallOutput';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';

type AiChatRecordApprovalDeckProps = {
  recordApprovals: AgentChatPendingRecordApproval[];
  answeringToolCallIds: string[];
  onAnsweringToolCallIdsChange: (toolCallIds: string[]) => void;
};

export const AiChatRecordApprovalDeck = ({
  recordApprovals,
  answeringToolCallIds,
  onAnsweringToolCallIdsChange,
}: AiChatRecordApprovalDeckProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const { getIcon } = useIcons();
  const { objectMetadataItems } = useObjectMetadataItems();
  const store = useStore();
  const { answerAgentChatToolCall } = useAnswerAgentChatToolCall();
  const [activeIndex, setActiveIndex] = useState(0);
  const [skippedToolCallIds, setSkippedToolCallIds] = useState<string[]>([]);

  const groupIds = [
    ...new Set(recordApprovals.map(getAgentChatRecordApprovalGroupId)),
  ];
  const isAnswering = recordApprovals.some(({ toolCallId }) =>
    answeringToolCallIds.includes(toolCallId),
  );

  const getGroupRecordApprovals = (groupId: string) =>
    recordApprovals.filter(
      (recordApproval) =>
        getAgentChatRecordApprovalGroupId(recordApproval) === groupId,
    );

  const answerRecordApprovals = async ({
    groupIdsToAnswer,
    isDenied,
  }: {
    groupIdsToAnswer: string[];
    isDenied: boolean;
  }) => {
    const recordApprovalsToAnswer = groupIdsToAnswer.flatMap(
      getGroupRecordApprovals,
    );

    onAnsweringToolCallIdsChange(
      recordApprovalsToAnswer.map(({ toolCallId }) => toolCallId),
    );

    // answers go to the conversation the batch started in, even if the person opens another one
    const threadId = store.get(agentChatDisplayedThreadState.atom);

    for (const { toolCallId, proposal } of recordApprovalsToAnswer) {
      const isApproved = !isDenied && !skippedToolCallIds.includes(toolCallId);
      const isAnswered = await answerAgentChatToolCall({
        threadId,
        toolCallId,
        response: {
          decision: isApproved ? 'approve' : 'reject',
        } satisfies ToolCallApprovalResponse,
        optimisticToolOutput: isApproved
          ? undefined
          : buildRejectedToolCallOutput({ proposal }),
      });

      if (!isAnswered) {
        onAnsweringToolCallIdsChange([]);

        return;
      }
    }
  };

  const cards = groupIds.map((groupId) => {
    const groupRecordApprovals = getGroupRecordApprovals(groupId);
    const { template, objectNameSingular } = groupRecordApprovals[0].proposal;
    const objectMetadataItem = objectMetadataItems.find(
      ({ nameSingular }) => nameSingular === objectNameSingular,
    );
    const toolCallIds = groupRecordApprovals.map(
      ({ toolCallId }) => toolCallId,
    );
    const selectedToolCallIds = toolCallIds.filter(
      (toolCallId) => !skippedToolCallIds.includes(toolCallId),
    );
    const recordCount = toolCallIds.length;
    const selectedCount = selectedToolCallIds.length;
    const objectLabel =
      (recordCount === 1
        ? objectMetadataItem?.labelSingular
        : objectMetadataItem?.labelPlural) ?? objectNameSingular;
    const { operation, title, approveLabel } = {
      recordCreate: {
        operation: 'create' as const,
        title: t`Create ${recordCount} ${objectLabel}`,
        approveLabel: t`Create ${selectedCount}`,
      },
      recordUpdate: {
        operation: 'update' as const,
        title: t`Update ${recordCount} ${objectLabel}`,
        approveLabel: t`Update ${selectedCount}`,
      },
      recordDelete: {
        operation: 'delete' as const,
        title: t`Delete ${recordCount} ${objectLabel}`,
        approveLabel: t`Delete ${selectedCount}`,
      },
    }[template];
    const Icon = getIcon(objectMetadataItem?.icon);

    return {
      id: groupId,
      title,
      icon: <Icon size={theme.icon.size.md} />,
      approveLabel,
      isDestructive: operation === 'delete',
      selectedCount,
      skippedCount: recordCount - selectedCount,
      status: toolCallIds.some((toolCallId) =>
        answeringToolCallIds.includes(toolCallId),
      )
        ? ('running' as const)
        : ('pending' as const),
      content: (
        <AiChatRecordApprovalReview
          objectNameSingular={objectNameSingular}
          operation={operation}
          label={title}
          recordApprovals={groupRecordApprovals}
          selectedToolCallIds={selectedToolCallIds}
          disabled={isAnswering}
          onSelectedToolCallIdsChange={(nextSelectedToolCallIds) =>
            setSkippedToolCallIds((currentSkippedToolCallIds) => [
              ...currentSkippedToolCallIds.filter(
                (toolCallId) => !toolCallIds.includes(toolCallId),
              ),
              ...toolCallIds.filter(
                (toolCallId) => !nextSelectedToolCallIds.includes(toolCallId),
              ),
            ])
          }
        />
      ),
    };
  });

  return (
    <AiChatApprovalReviewDeck
      cards={cards}
      activeIndex={Math.min(activeIndex, cards.length - 1)}
      onActiveIndexChange={setActiveIndex}
      onRequestApproval={(groupIdsToAnswer) =>
        void answerRecordApprovals({ groupIdsToAnswer, isDenied: false })
      }
      onDeny={(groupId) =>
        void answerRecordApprovals({
          groupIdsToAnswer: [groupId],
          isDenied: true,
        })
      }
      disabled={isAnswering}
    />
  );
};
