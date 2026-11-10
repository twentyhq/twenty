import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { type ToolCallApprovalResponse } from 'twenty-shared/ai';
import { useIcons } from 'twenty-ui/icon/provider';
import { useTheme } from 'twenty-ui/theme';

import { AiChatApprovalReviewDeck } from '@/ai/components/AiChatApprovalReviewDeck';
import { AiChatRecordCreationApprovalReview } from '@/ai/components/AiChatRecordCreationApprovalReview';
import { useAnswerAgentChatToolCall } from '@/ai/hooks/useAnswerAgentChatToolCall';
import { type AgentChatPendingRecordCreation } from '@/ai/types/AgentChatPendingRecordCreation';
import { buildRejectedToolCallOutput } from '@/ai/utils/buildRejectedToolCallOutput';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';

type AiChatRecordCreationApprovalDeckProps = {
  recordCreations: AgentChatPendingRecordCreation[];
  answeringToolCallIds: string[];
  onAnsweringToolCallIdsChange: (toolCallIds: string[]) => void;
};

export const AiChatRecordCreationApprovalDeck = ({
  recordCreations,
  answeringToolCallIds,
  onAnsweringToolCallIdsChange,
}: AiChatRecordCreationApprovalDeckProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const { getIcon } = useIcons();
  const { objectMetadataItems } = useObjectMetadataItems();
  const { answerAgentChatToolCall } = useAnswerAgentChatToolCall();
  const [activeIndex, setActiveIndex] = useState(0);
  const [skippedToolCallIds, setSkippedToolCallIds] = useState<string[]>([]);

  const objectNames = [
    ...new Set(
      recordCreations.map(({ proposal }) => proposal.objectNameSingular),
    ),
  ];
  const isAnswering = recordCreations.some(({ toolCallId }) =>
    answeringToolCallIds.includes(toolCallId),
  );

  const getObjectRecordCreations = (objectNameSingular: string) =>
    recordCreations.filter(
      ({ proposal }) => proposal.objectNameSingular === objectNameSingular,
    );

  const answerRecordCreations = async ({
    objectNamesToAnswer,
    isDenied,
  }: {
    objectNamesToAnswer: string[];
    isDenied: boolean;
  }) => {
    const recordCreationsToAnswer = objectNamesToAnswer.flatMap(
      getObjectRecordCreations,
    );

    onAnsweringToolCallIdsChange(
      recordCreationsToAnswer.map(({ toolCallId }) => toolCallId),
    );

    for (const { toolCallId, proposal } of recordCreationsToAnswer) {
      const isApproved = !isDenied && !skippedToolCallIds.includes(toolCallId);
      const isAnswered = await answerAgentChatToolCall({
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

  const cards = objectNames.map((objectNameSingular) => {
    const objectRecordCreations = getObjectRecordCreations(objectNameSingular);
    const objectMetadataItem = objectMetadataItems.find(
      ({ nameSingular }) => nameSingular === objectNameSingular,
    );
    const toolCallIds = objectRecordCreations.map(
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
    const title = t`Create ${recordCount} ${objectLabel}`;
    const Icon = getIcon(objectMetadataItem?.icon);

    return {
      id: objectNameSingular,
      title,
      icon: <Icon size={theme.icon.size.md} />,
      approveLabel: t`Create ${selectedCount}`,
      selectedCount,
      skippedCount: recordCount - selectedCount,
      status: toolCallIds.some((toolCallId) =>
        answeringToolCallIds.includes(toolCallId),
      )
        ? ('running' as const)
        : ('pending' as const),
      content: (
        <AiChatRecordCreationApprovalReview
          objectNameSingular={objectNameSingular}
          label={title}
          recordCreations={objectRecordCreations}
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
      onRequestApproval={(objectNamesToAnswer) =>
        void answerRecordCreations({ objectNamesToAnswer, isDenied: false })
      }
      onDeny={(objectNameSingular) =>
        void answerRecordCreations({
          objectNamesToAnswer: [objectNameSingular],
          isDenied: true,
        })
      }
      disabled={isAnswering}
    />
  );
};
