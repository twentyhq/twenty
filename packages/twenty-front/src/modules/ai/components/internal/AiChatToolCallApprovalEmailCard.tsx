import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isString } from '@sniptt/guards';
import { type JSONContent } from '@tiptap/core';
import { useState } from 'react';
import { type ProposedToolCall } from 'twenty-shared/ai';
import {
  isPlainObject,
  parseCanonicalTipTapJsonDocument,
} from 'twenty-shared/utils';
import { LightButton } from 'twenty-ui/components';
import { IconDeviceFloppy, IconSend, IconTrash } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

import { parseEmailRecipients } from '@/activities/emails/recipients/utils/parseEmailRecipients';
import { serializeEmailRecipients } from '@/activities/emails/recipients/utils/serializeEmailRecipients';
import { INLINE_EMAIL_BODY_EDITOR_PROFILE } from '@/activities/emails/editor/constants/InlineEmailBodyEditorProfile';
import { FormAdvancedTextFieldInput } from '@/advanced-text-editor/components/FormAdvancedTextFieldInput';
import { serializeJsonContentAsAdvancedTextEditorDocument } from '@/advanced-text-editor/utils/serializeJsonContentAsAdvancedTextEditorDocument';
import { AiChatEmailRecipientsRow } from '@/ai/components/internal/AiChatEmailRecipientsRow';
import { AiChatToolCallApprovalCardLayout } from '@/ai/components/internal/AiChatToolCallApprovalCardLayout';
import { useAnswerToolCallApproval } from '@/ai/hooks/useAnswerToolCallApproval';

const EMAIL_TOOL_NAMES = {
  send: 'send_email',
  draft: 'draft_email',
} as const;

const StyledSubjectInput = styled.input`
  background: transparent;
  border: none;
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  color: ${themeCssVariables.font.color.primary};
  font-family: inherit;
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  outline: none;
  padding: ${themeCssVariables.spacing[1]} 0;
`;

const StyledRecipientToggles = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
`;

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

  const initialRecipients = readRecipients(proposal.arguments);
  const [to, setTo] = useState(initialRecipients.to);
  const [cc, setCc] = useState(initialRecipients.cc);
  const [bcc, setBcc] = useState(initialRecipients.bcc);
  // Kept once shown, so removing the last recipient doesn't hide the field.
  const [isCcShown, setIsCcShown] = useState(cc.length > 0);
  const [isBccShown, setIsBccShown] = useState(bcc.length > 0);
  const [subject, setSubject] = useState(
    isString(proposal.arguments.subject) ? proposal.arguments.subject : '',
  );
  const [body, setBody] = useState<unknown>(proposal.arguments.body);

  const runnableToolNames = [
    proposal.toolName,
    ...(proposal.alternativeToolNames ?? []),
  ];
  const canSend = runnableToolNames.includes(EMAIL_TOOL_NAMES.send);
  const canSaveDraft = runnableToolNames.includes(EMAIL_TOOL_NAMES.draft);

  const handleBodyChange = (serializedBody: string) => {
    setBody(parseCanonicalTipTapJsonDocument(serializedBody) ?? serializedBody);
  };

  const approveWith = (toolName: string) => {
    approve({
      toolName,
      arguments: {
        ...proposal.arguments,
        recipients: {
          to: serializeEmailRecipients(to),
          cc: serializeEmailRecipients(cc),
          bcc: serializeEmailRecipients(bcc),
        },
        subject,
        body,
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
              disabled={isAnswering || to.length === 0}
              loading={pendingToolName === EMAIL_TOOL_NAMES.send}
              onClick={() => approveWith(EMAIL_TOOL_NAMES.send)}
            >
              {t`Send`}
            </Button>
          )}
        </>
      }
    >
      <AiChatEmailRecipientsRow
        label={t`To`}
        recipients={to}
        disabled={isAnswering}
        onChange={setTo}
      />
      {(!isCcShown || !isBccShown) && (
        <StyledRecipientToggles>
          {!isCcShown && (
            <LightButton
              disabled={isAnswering}
              onClick={() => setIsCcShown(true)}
            >
              {t`Cc`}
            </LightButton>
          )}
          {!isBccShown && (
            <LightButton
              disabled={isAnswering}
              onClick={() => setIsBccShown(true)}
            >
              {t`Bcc`}
            </LightButton>
          )}
        </StyledRecipientToggles>
      )}
      {isCcShown && (
        <AiChatEmailRecipientsRow
          label={t`Cc`}
          recipients={cc}
          disabled={isAnswering}
          onChange={setCc}
        />
      )}
      {isBccShown && (
        <AiChatEmailRecipientsRow
          label={t`Bcc`}
          recipients={bcc}
          disabled={isAnswering}
          onChange={setBcc}
        />
      )}
      <StyledSubjectInput
        aria-label={t`Subject`}
        placeholder={t`Subject`}
        value={subject}
        disabled={isAnswering}
        onChange={(event) => setSubject(event.target.value)}
      />
      <FormAdvancedTextFieldInput
        defaultValue={serializeEmailBody(proposal.arguments.body)}
        onChange={handleBodyChange}
        readonly={isAnswering}
        placeholder={t`Write the email`}
        profile={INLINE_EMAIL_BODY_EDITOR_PROFILE}
      />
    </AiChatToolCallApprovalCardLayout>
  );
};
