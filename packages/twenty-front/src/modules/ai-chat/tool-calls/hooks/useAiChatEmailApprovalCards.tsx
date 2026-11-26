import { Plural, useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { IconMail } from 'twenty-ui/icon';
import { useTheme } from 'twenty-ui/theme';

import { AiChatApprovalEmailReview } from '@/ai-chat/tool-calls/components/AiChatApprovalEmailReview';
import { AI_CHAT_EMAIL_TOOL_NAMES } from '@/ai-chat/tool-calls/constants/AiChatEmailToolNames';
import { useAnswerAiChatToolCall } from '@/ai-chat/tool-calls/hooks/useAnswerAiChatToolCall';
import { type AiChatApprovalReviewCard } from '@/ai-chat/tool-calls/types/AiChatApprovalReviewCard';
import { type AiChatApprovalReviewEmailDraft } from '@/ai-chat/tool-calls/types/AiChatApprovalReviewEmailDraft';
import { type AiChatApprovalReviewStatus } from '@/ai-chat/tool-calls/types/AiChatApprovalReviewStatus';
import { type AiChatPendingEmailApproval } from '@/ai-chat/tool-calls/types/AiChatPendingEmailApproval';
import { buildAiChatApprovalReviewEmailDraft } from '@/ai-chat/tool-calls/utils/buildAiChatApprovalReviewEmailDraft';
import { buildAiChatEmailToolArguments } from '@/ai-chat/tool-calls/utils/buildAiChatEmailToolArguments';
import { buildRejectedToolCallOutput } from '@/ai-chat/tool-calls/utils/buildRejectedToolCallOutput';

type AiChatEmailApprovalOutcome = 'success' | 'skipped';

type UseAiChatEmailApprovalCardsProps = {
  emailApprovals: AiChatPendingEmailApproval[];
  answeringToolCallIds: string[];
  onAnsweringToolCallIdsChange: (toolCallIds: string[]) => void;
  onCardAnswered?: (cardId: string) => void;
};

export const useAiChatEmailApprovalCards = ({
  emailApprovals,
  answeringToolCallIds,
  onAnsweringToolCallIdsChange,
  onCardAnswered,
}: UseAiChatEmailApprovalCardsProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const { answerAiChatToolCall } = useAnswerAiChatToolCall();
  // answered calls leave the pending list, so the first batch keeps their card and position
  const [initialEmailApprovals] = useState(emailApprovals);
  const [draftByToolCallId, setDraftByToolCallId] = useState<
    Record<string, AiChatApprovalReviewEmailDraft>
  >({});
  const [outcomeByToolCallId, setOutcomeByToolCallId] = useState<
    Record<string, AiChatEmailApprovalOutcome>
  >({});

  const reviewedEmailApprovals = [
    ...initialEmailApprovals,
    ...emailApprovals.filter(
      ({ toolCallId }) =>
        !initialEmailApprovals.some(
          (initialEmailApproval) =>
            initialEmailApproval.toolCallId === toolCallId,
        ),
    ),
  ].filter(
    ({ toolCallId }) =>
      toolCallId in outcomeByToolCallId ||
      emailApprovals.some(
        (emailApproval) => emailApproval.toolCallId === toolCallId,
      ),
  );

  const getDraft = ({ toolCallId, proposal }: AiChatPendingEmailApproval) =>
    draftByToolCallId[toolCallId] ??
    buildAiChatApprovalReviewEmailDraft(proposal);

  const getStatus = ({
    toolCallId,
  }: AiChatPendingEmailApproval): AiChatApprovalReviewStatus =>
    outcomeByToolCallId[toolCallId] ??
    (answeringToolCallIds.includes(toolCallId) ? 'running' : 'pending');

  const recordOutcome = (
    toolCallId: string,
    outcome: AiChatEmailApprovalOutcome,
  ) =>
    setOutcomeByToolCallId((currentOutcomeByToolCallId) => ({
      ...currentOutcomeByToolCallId,
      [toolCallId]: outcome,
    }));

  const approveCards = async (cardIds: string[]) => {
    const emailApprovalsToAnswer = reviewedEmailApprovals.filter(
      (emailApproval) =>
        cardIds.includes(emailApproval.toolCallId) &&
        getStatus(emailApproval) === 'pending',
    );

    onAnsweringToolCallIdsChange(
      emailApprovalsToAnswer.map(({ toolCallId }) => toolCallId),
    );

    for (const emailApproval of emailApprovalsToAnswer) {
      const { toolCallId, proposal } = emailApproval;
      const isAnswered = await answerAiChatToolCall({
        toolCallId,
        response: {
          decision: 'approve',
          toolName: proposal.toolName,
          arguments: buildAiChatEmailToolArguments({
            proposal,
            draft: getDraft(emailApproval),
          }),
        },
      });

      if (!isAnswered) {
        onAnsweringToolCallIdsChange([]);

        return;
      }

      recordOutcome(toolCallId, 'success');
    }

    if (emailApprovalsToAnswer.length === 1) {
      onCardAnswered?.(emailApprovalsToAnswer[0].toolCallId);
    }
  };

  const denyCard = async (cardId: string) => {
    const emailApproval = reviewedEmailApprovals.find(
      ({ toolCallId }) => toolCallId === cardId,
    );

    if (!isDefined(emailApproval) || getStatus(emailApproval) !== 'pending') {
      return;
    }

    onAnsweringToolCallIdsChange([cardId]);

    const isAnswered = await answerAiChatToolCall({
      toolCallId: cardId,
      response: { decision: 'reject' },
      optimisticToolOutput: buildRejectedToolCallOutput({
        proposal: emailApproval.proposal,
      }),
    });

    if (!isAnswered) {
      onAnsweringToolCallIdsChange([]);

      return;
    }

    recordOutcome(cardId, 'skipped');
    onCardAnswered?.(cardId);
  };

  const isAnswering = reviewedEmailApprovals.some(
    (emailApproval) => getStatus(emailApproval) === 'running',
  );

  const cards = reviewedEmailApprovals.map<AiChatApprovalReviewCard>(
    (emailApproval, index) => {
      const { toolCallId, proposal } = emailApproval;
      const draft = getDraft(emailApproval);
      const status = getStatus(emailApproval);
      const isDraft = proposal.toolName === AI_CHAT_EMAIL_TOOL_NAMES.draft;
      const hasRecipient = isNonEmptyArray(draft.to);
      const remainingDraftCount = reviewedEmailApprovals
        .slice(index + 1)
        .filter(
          (nextEmailApproval) => getStatus(nextEmailApproval) === 'pending',
        ).length;
      const successMessage = isDraft ? t`Draft saved` : t`Email sent`;

      return {
        id: toolCallId,
        title: isDraft ? t`Draft email` : t`Send email`,
        icon: <IconMail size={theme.icon.size.md} />,
        approveLabel: isDraft ? t`Save draft` : t`Send`,
        denyLabel: t`Skip`,
        selectedCount: 1,
        skippedCount: 0,
        status,
        isApprovalDisabled: !hasRecipient,
        outcomeMessage:
          status === 'success'
            ? successMessage
            : status === 'skipped'
              ? t`This draft was not sent.`
              : undefined,
        hint: hasRecipient ? (
          <Plural
            value={remainingDraftCount}
            _0="No more drafts after this one"
            one="# more draft after this one"
            other="# more drafts after this one"
          />
        ) : (
          t`Add a recipient before sending`
        ),
        content: (
          <AiChatApprovalEmailReview
            draft={draft}
            disabled={isAnswering || status !== 'pending'}
            onDraftChange={(update) =>
              setDraftByToolCallId((currentDraftByToolCallId) => ({
                ...currentDraftByToolCallId,
                [toolCallId]: update(
                  currentDraftByToolCallId[toolCallId] ??
                    buildAiChatApprovalReviewEmailDraft(proposal),
                ),
              }))
            }
            onDelete={() => void denyCard(toolCallId)}
          />
        ),
      };
    },
  );

  return { cards, approveCards, denyCard, isAnswering };
};
