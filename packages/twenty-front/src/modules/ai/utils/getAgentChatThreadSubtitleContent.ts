import {
  type AgentChatThreadRowMetadata,
  isAgentChatMentionUnresolved,
} from 'twenty-shared/ai';
import { type AgentChatThreadParticipantFieldsFragment } from '~/generated-metadata/graphql';
import { type AiChatThreadReason } from '@/ai/types/AiChatThreadReason';
import { isDefined, isNonEmptyString } from 'twenty-shared/utils';

import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { getAgentChatThreadPreviewText } from '@/ai/utils/getAgentChatThreadPreviewText';
import { type PartialWorkspaceMember } from '@/settings/roles/types/RoleWithPartialMembers';

const getReason = ({
  isDeleted,
  isAwaitingAnswer,
  hasUnresolvedMention,
  isAssignedToCurrentMember,
  executionOutcome,
}: {
  isDeleted: boolean;
  isAwaitingAnswer: boolean;
  hasUnresolvedMention: boolean;
  isAssignedToCurrentMember: boolean;
  executionOutcome: AgentChatThreadRowMetadata['executionOutcome'];
}): AiChatThreadReason | null => {
  if (isDeleted) {
    return null;
  }
  if (isAwaitingAnswer) {
    return 'needsInput';
  }
  if (hasUnresolvedMention) {
    return 'mentioned';
  }
  if (isAssignedToCurrentMember) {
    return 'assigned';
  }
  return executionOutcome;
};

export const getAgentChatThreadSubtitleContent = ({
  thread,
  draftPreviewText,
  workspaceMembers,
  currentWorkspaceMemberId,
  rowMetadata,
  participant,
}: {
  thread: AgentChatThreadRecord;
  draftPreviewText: string | null | undefined;
  workspaceMembers: PartialWorkspaceMember[];
  currentWorkspaceMemberId: string | undefined;
  rowMetadata?: AgentChatThreadRowMetadata | null;
  participant?: Pick<
    AgentChatThreadParticipantFieldsFragment,
    'lastMentionedAt' | 'mentionsResolvedAt'
  >;
}) => {
  const isAwaitingAnswer =
    !isDefined(thread.deletedAt) && isDefined(thread.pendingQuestionMessageId);
  const hasUnresolvedMention = isAgentChatMentionUnresolved({
    lastMentionedAt: participant?.lastMentionedAt,
    mentionsResolvedAt: participant?.mentionsResolvedAt,
  });
  const isAssignedToCurrentMember =
    isDefined(currentWorkspaceMemberId) &&
    thread.assigneeId === currentWorkspaceMemberId;
  const reason = getReason({
    isDeleted: isDefined(thread.deletedAt),
    isAwaitingAnswer,
    hasUnresolvedMention,
    isAssignedToCurrentMember,
    executionOutcome: rowMetadata?.executionOutcome ?? null,
  });
  const hasDraft = isNonEmptyString(draftPreviewText);
  const previewText = hasDraft
    ? draftPreviewText
    : getAgentChatThreadPreviewText({
        thread,
        workspaceMembers,
        currentWorkspaceMemberId,
        rowMetadata,
      });

  return {
    isAwaitingAnswer,
    reason,
    hasDraft,
    previewText,
    hasContent: isDefined(reason) || hasDraft || isNonEmptyString(previewText),
  };
};
