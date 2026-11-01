import { useLingui } from '@lingui/react/macro';
import { isString } from '@sniptt/guards';
import { type JSONContent } from '@tiptap/core';
import { useState } from 'react';
import { type ProposedToolCall } from 'twenty-shared/ai';
import {
  isNonEmptyArray,
  isPlainObject,
  parseCanonicalTipTapJsonDocument,
} from 'twenty-shared/utils';
import { IconDeviceFloppy, IconSend, IconTrash } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';

import { parseEmailRecipients } from '@/activities/emails/recipients/utils/parseEmailRecipients';
import { serializeEmailRecipients } from '@/activities/emails/recipients/utils/serializeEmailRecipients';
import { serializeJsonContentAsAdvancedTextEditorDocument } from '@/advanced-text-editor/utils/serializeJsonContentAsAdvancedTextEditorDocument';
import { AiChatApprovalEmailReview } from '@/ai/components/AiChatApprovalEmailReview';
import { AiChatToolCallApprovalCardLayout } from '@/ai/components/internal/AiChatToolCallApprovalCardLayout';
import { useAnswerToolCallApproval } from '@/ai/hooks/useAnswerToolCallApproval';
import { type AiChatApprovalReviewEmailDraft } from '@/ai/types/AiChatApprovalReviewEmailDraft';

const EMAIL_TOOL_NAMES = {
  send: 'send_email',
  draft: 'draft_email',
} as const;

const readRecipients = (toolArguments: Record<string, unknown>) => {
  const recipients = isPlainObject(toolArguments.recipients)
    ? toolArguments.recipients
    : {};

  return {
    to: parseEmailRecipients(isString(recipients.to) ? recipients.to : ''),
    cc: parseEmailRecipients(isString(recipients.cc) ? recipients.cc : ''),
    bcc: parseEmailRecipients(isString(recipients.bcc) ? recipients.bcc : ''),
  };
};

// the editor reads a document, or an HTML string through its legacy parser
const serializeEmailBody = (body: unknown): string =>
  isString(body)
    ? body
    : isPlainObject(body)
      ? serializeJsonContentAsAdvancedTextEditorDocument(body as JSONContent)
      : '';

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

  const [originalBody] = useState<unknown>(() => proposal.arguments.body);
  const serializedOriginalBody = serializeEmailBody(originalBody);
  const [draft, setDraft] = useState<AiChatApprovalReviewEmailDraft>(() => {
    const recipients = readRecipients(proposal.arguments);

    return {
      ...recipients,
      subject: isString(proposal.arguments.subject)
        ? proposal.arguments.subject
        : '',
      body: serializedOriginalBody,
      isCcBccExpanded:
        isNonEmptyArray(recipients.cc) || isNonEmptyArray(recipients.bcc),
    };
  });

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
        body:
          draft.body === serializedOriginalBody
            ? originalBody
            : (parseCanonicalTipTapJsonDocument(draft.body) ?? draft.body),
      },
    });
  };

  const pendingToolName =
    pendingResponse?.decision === 'approve'
      ? (pendingResponse.toolName ?? proposal.toolName)
      : null;

  return (
    <AiChatToolCallApprovalCardLayout
      label={t`Review this email before it goes out`}
      summary={proposal.summary}
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
