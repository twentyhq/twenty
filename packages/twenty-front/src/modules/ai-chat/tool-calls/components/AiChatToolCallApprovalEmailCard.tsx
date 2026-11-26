import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { type ProposedToolCall } from 'twenty-shared/ai';
import { isNonEmptyArray } from 'twenty-shared/utils';
import {
  IconDeviceFloppy,
  IconMail,
  IconSend,
  IconTrash,
} from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';

import { AiChatApprovalEmailReview } from '@/ai-chat/tool-calls/components/AiChatApprovalEmailReview';
import { AiChatToolCallApprovalCardLayout } from '@/ai-chat/tool-calls/components/AiChatToolCallApprovalCardLayout';
import { AI_CHAT_EMAIL_TOOL_NAMES } from '@/ai-chat/tool-calls/constants/AiChatEmailToolNames';
import { useAnswerToolCallApproval } from '@/ai-chat/tool-calls/hooks/useAnswerToolCallApproval';
import { type AiChatApprovalReviewEmailDraft } from '@/ai-chat/tool-calls/types/AiChatApprovalReviewEmailDraft';
import { buildAiChatApprovalReviewEmailDraft } from '@/ai-chat/tool-calls/utils/buildAiChatApprovalReviewEmailDraft';
import { buildAiChatEmailToolArguments } from '@/ai-chat/tool-calls/utils/buildAiChatEmailToolArguments';

type AiChatToolCallApprovalEmailCardProps = {
  toolCallId: string;
  proposal: ProposedToolCall;
};

export const AiChatToolCallApprovalEmailCard = ({
  toolCallId,
  proposal,
}: AiChatToolCallApprovalEmailCardProps) => {
  const { t } = useLingui();
  const approval = useAnswerToolCallApproval({ toolCallId, proposal });
  const { pendingResponse, isAnswering, approve, reject } = approval;

  const [draft, setDraft] = useState<AiChatApprovalReviewEmailDraft>(() =>
    buildAiChatApprovalReviewEmailDraft(proposal),
  );

  const runnableToolNames = [
    proposal.toolName,
    ...(proposal.alternativeToolNames ?? []),
  ];
  const canSend = runnableToolNames.includes(AI_CHAT_EMAIL_TOOL_NAMES.send);
  const canSaveDraft = runnableToolNames.includes(
    AI_CHAT_EMAIL_TOOL_NAMES.draft,
  );

  const approveWith = (toolName: string) => {
    approve({
      toolName,
      arguments: buildAiChatEmailToolArguments({ proposal, draft }),
    });
  };

  const pendingToolName =
    pendingResponse?.decision === 'approve'
      ? (pendingResponse.toolName ?? proposal.toolName)
      : null;

  return (
    <AiChatToolCallApprovalCardLayout
      title={
        proposal.toolName === AI_CHAT_EMAIL_TOOL_NAMES.draft
          ? t`Draft email`
          : t`Send email`
      }
      Icon={IconMail}
      actions={
        <>
          <Button
            size="sm"
            variant="ghost"
            startIcon={<IconTrash />}
            disabled={isAnswering}
            loading={pendingResponse?.decision === 'reject'}
            onClick={reject}
          >
            {t`Discard`}
          </Button>
          {canSaveDraft && (
            <Button
              size="sm"
              variant="outline"
              startIcon={<IconDeviceFloppy />}
              disabled={isAnswering}
              loading={pendingToolName === AI_CHAT_EMAIL_TOOL_NAMES.draft}
              onClick={() => approveWith(AI_CHAT_EMAIL_TOOL_NAMES.draft)}
            >
              {t`Save as draft`}
            </Button>
          )}
          {canSend && (
            <Button
              size="sm"
              variant="solid"
              color="accent"
              startIcon={<IconSend />}
              disabled={isAnswering || !isNonEmptyArray(draft.to)}
              loading={pendingToolName === AI_CHAT_EMAIL_TOOL_NAMES.send}
              onClick={() => approveWith(AI_CHAT_EMAIL_TOOL_NAMES.send)}
            >
              {t`Send`}
            </Button>
          )}
        </>
      }
    >
      <AiChatApprovalEmailReview
        draft={draft}
        onDraftChange={setDraft}
        disabled={isAnswering}
      />
    </AiChatToolCallApprovalCardLayout>
  );
};
