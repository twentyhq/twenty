import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type FocusEvent, useId, useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import {
  type EmailApprovalDecision,
  type EmailApprovalResponse,
  type ProposeEmailToolResult,
  type ProposedEmail,
} from 'twenty-shared/ai';
import { LightButton } from 'twenty-ui/components';
import { IconDeviceFloppy, IconSend, IconTrash } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

import { parseEmailRecipients } from '@/activities/emails/recipients/utils/parseEmailRecipients';
import { serializeEmailRecipients } from '@/activities/emails/recipients/utils/serializeEmailRecipients';
import { StyledAiChatAskCard } from '@/ai/components/AiChatAskStyledComponents';
import { AiChatEmailRecipientsRow } from '@/ai/components/internal/AiChatEmailRecipientsRow';
import { useAnswerAgentChatToolCall } from '@/ai/hooks/useAnswerAgentChatToolCall';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';

const StyledHeader = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]} 0;
`;

const StyledFields = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
`;

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

const StyledBodyTextarea = styled(TextareaAutosize)`
  background: transparent;
  border: none;
  color: ${themeCssVariables.font.color.primary};
  font-family: inherit;
  font-size: ${themeCssVariables.font.size.md};
  line-height: 1.5;
  outline: none;
  padding: ${themeCssVariables.spacing[1]} 0;
  resize: none;
`;

const StyledRecipientToggles = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledDivider = styled.div`
  background: ${themeCssVariables.border.color.light};
  height: 1px;
  width: 100%;
`;

const StyledActions = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: flex-end;
  padding: ${themeCssVariables.spacing[2]};
`;

type AiChatEmailApprovalCardProps = {
  toolCallId: string;
  email: ProposedEmail;
};

export const AiChatEmailApprovalCard = ({
  toolCallId,
  email,
}: AiChatEmailApprovalCardProps) => {
  const { t } = useLingui();
  const focusId = useId();
  const { answerAgentChatToolCall } = useAnswerAgentChatToolCall();
  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();
  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();

  const [to, setTo] = useState(() => parseEmailRecipients(email.recipients.to));
  const [cc, setCc] = useState(() => parseEmailRecipients(email.recipients.cc));
  const [bcc, setBcc] = useState(() =>
    parseEmailRecipients(email.recipients.bcc),
  );
  // Kept once shown, so removing the last recipient doesn't hide the field.
  const [isCcShown, setIsCcShown] = useState(cc.length > 0);
  const [isBccShown, setIsBccShown] = useState(bcc.length > 0);
  const [subject, setSubject] = useState(email.subject);
  const [body, setBody] = useState(email.body);
  const [pendingDecision, setPendingDecision] =
    useState<EmailApprovalDecision | null>(null);

  const isAnswering = pendingDecision !== null;

  // Blocks page shortcuts while typing; buttons are excluded since one removed on click may never blur.
  const handleFieldFocus = (event: FocusEvent) => {
    if (
      !(event.target instanceof HTMLInputElement) &&
      !(event.target instanceof HTMLTextAreaElement)
    ) {
      return;
    }

    pushFocusItemToFocusStack({
      focusId,
      component: { type: FocusComponentType.TEXT_AREA, instanceId: focusId },
      globalHotkeysConfig: {
        enableGlobalHotkeysConflictingWithKeyboard: false,
      },
    });
  };

  const handleFieldBlur = () => {
    removeFocusItemFromFocusStackById({ focusId });
  };

  const decide = async (decision: EmailApprovalDecision) => {
    setPendingDecision(decision);

    const editedEmail: ProposedEmail = {
      ...email,
      recipients: {
        to: serializeEmailRecipients(to),
        cc: serializeEmailRecipients(cc),
        bcc: serializeEmailRecipients(bcc),
      },
      subject,
      body,
    };
    const response: EmailApprovalResponse =
      decision === 'discard' ? { decision } : { decision, email: editedEmail };

    const isAnswered = await answerAgentChatToolCall({
      toolCallId,
      response,
      // Only a discard is known before the server answers.
      optimisticToolOutput:
        decision === 'discard'
          ? {
              success: true,
              result: {
                status: 'discarded',
                email,
              } satisfies ProposeEmailToolResult,
            }
          : undefined,
    });

    // The card goes once its call is closed, so it stays disabled until then.
    if (!isAnswered) {
      setPendingDecision(null);
    }
  };

  return (
    <StyledAiChatAskCard>
      <StyledHeader>{t`Review this email before it goes out`}</StyledHeader>
      <StyledFields onFocus={handleFieldFocus} onBlur={handleFieldBlur}>
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
        <StyledBodyTextarea
          aria-label={t`Email body`}
          minRows={4}
          maxRows={16}
          value={body}
          disabled={isAnswering}
          onChange={(event) => setBody(event.target.value)}
        />
      </StyledFields>
      <StyledDivider />
      <StyledActions>
        <Button
          size="sm"
          variant="ghost"
          startIcon={<IconTrash />}
          disabled={isAnswering}
          loading={pendingDecision === 'discard'}
          onClick={() => void decide('discard')}
        >
          {t`Discard`}
        </Button>
        <Button
          size="sm"
          variant="outline"
          startIcon={<IconDeviceFloppy />}
          disabled={isAnswering}
          loading={pendingDecision === 'saveDraft'}
          onClick={() => void decide('saveDraft')}
        >
          {t`Save as draft`}
        </Button>
        <Button
          size="sm"
          variant="solid"
          color="accent"
          startIcon={<IconSend />}
          disabled={isAnswering || to.length === 0}
          loading={pendingDecision === 'send'}
          onClick={() => void decide('send')}
        >
          {t`Send`}
        </Button>
      </StyledActions>
    </StyledAiChatAskCard>
  );
};
