import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { type ProposedToolCall } from 'twenty-shared/ai';
import {
  isNonEmptyArray,
  parseCanonicalTipTapJsonDocument,
} from 'twenty-shared/utils';
import {
  IconDeviceFloppy,
  IconMail,
  IconSend,
  IconTrash,
} from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';

import { serializeEmailRecipients } from '@/activities/emails/recipients/utils/serializeEmailRecipients';
import { AiChatApprovalEmailReview } from '@/ai-chat/tool-calls/components/AiChatApprovalEmailReview';
import { AiChatToolCallApprovalCardLayout } from '@/ai-chat/tool-calls/components/AiChatToolCallApprovalCardLayout';
import { EMAIL_TOOL_NAMES } from '@/ai-chat/tool-calls/constants/EmailToolNames';
import { useAnswerToolCallApproval } from '@/ai-chat/tool-calls/hooks/useAnswerToolCallApproval';
import { type AiChatApprovalReviewEmailDraft } from '@/ai-chat/tool-calls/types/AiChatApprovalReviewEmailDraft';
import { getProposedToolCallLabel } from '@/ai-chat/tool-calls/utils/getProposedToolCallLabel';
import { readEmailDraftFromToolArguments } from '@/ai-chat/tool-calls/utils/readEmailDraftFromToolArguments';

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
    readEmailDraftFromToolArguments(proposal.arguments),
  );

  const runnableToolNames = [
    proposal.toolName,
    ...(proposal.alternativeToolNames ?? []),
  ];
  const canSend = runnableToolNames.includes(EMAIL_TOOL_NAMES.send);
  const canSaveDraft = runnableToolNames.includes(EMAIL_TOOL_NAMES.draft);

  const approveWith = (toolName: string) => {
    approve({
      toolName,
      arguments: {
        ...proposal.arguments,
        recipients: {
          to: serializeEmailRecipients(draft.to),
          cc: serializeEmailRecipients(draft.cc),
          bcc: serializeEmailRecipients(draft.bcc),
        },
        subject: draft.subject,
        body: parseCanonicalTipTapJsonDocument(draft.body),
      },
    });
  };

  const pendingToolName =
    pendingResponse?.decision === 'approve'
      ? (pendingResponse.toolName ?? proposal.toolName)
      : null;

  return (
    <AiChatToolCallApprovalCardLayout
      title={getProposedToolCallLabel(proposal)}
      Icon={IconMail}
      approval={approval}
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
              loading={pendingToolName === EMAIL_TOOL_NAMES.draft}
              onClick={() => approveWith(EMAIL_TOOL_NAMES.draft)}
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
              loading={pendingToolName === EMAIL_TOOL_NAMES.send}
              onClick={() => approveWith(EMAIL_TOOL_NAMES.send)}
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
