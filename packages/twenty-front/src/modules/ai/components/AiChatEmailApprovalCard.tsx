import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useId, useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import {
  type EmailApprovalDecision,
  type InputAskEmailApprovalResponse,
  type ProposeEmailToolResult,
  type ProposedEmail,
} from 'twenty-shared/ai';
import { LightButton } from 'twenty-ui/components';
import { IconDeviceFloppy, IconSend, IconTrash } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

import { AiChatEmailRecipientsRow } from '@/ai/components/internal/AiChatEmailRecipientsRow';
import { useAnswerAgentChatAsk } from '@/ai/hooks/useAnswerAgentChatAsk';
import { splitEmailRecipients } from '@/ai/utils/splitEmailRecipients';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';

const StyledCard = styled.div`
  background-color: ${themeCssVariables.background.transparent.lighter};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  width: 100%;
`;

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
  askId: string;
  toolCallId: string;
  email: ProposedEmail;
};

export const AiChatEmailApprovalCard = ({
  askId,
  toolCallId,
  email,
}: AiChatEmailApprovalCardProps) => {
  const { t } = useLingui();
  const focusId = useId();
  const { answerAgentChatAsk } = useAnswerAgentChatAsk();
  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();
  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();

  const [to, setTo] = useState(() => splitEmailRecipients(email.recipients.to));
  const [cc, setCc] = useState(() => splitEmailRecipients(email.recipients.cc));
  const [bcc, setBcc] = useState(() =>
    splitEmailRecipients(email.recipients.bcc),
  );
  // Shown from the start when the draft has any, and kept once opened, so
  // removing the last recipient does not take the field away.
  const [isCcShown, setIsCcShown] = useState(cc.length > 0);
  const [isBccShown, setIsBccShown] = useState(bcc.length > 0);
  const [subject, setSubject] = useState(email.subject);
  const [body, setBody] = useState(email.body);
  const [pendingDecision, setPendingDecision] =
    useState<EmailApprovalDecision | null>(null);

  const isAnswering = pendingDecision !== null;

  // Typing in the card must not trigger the page's keyboard shortcuts.
  const handleFieldFocus = () => {
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
    if (isAnswering) {
      return;
    }

    setPendingDecision(decision);

    const editedEmail: ProposedEmail = {
      ...email,
      recipients: { to: to.join(', '), cc: cc.join(', '), bcc: bcc.join(', ') },
      subject,
      body,
    };
    const response: InputAskEmailApprovalResponse =
      decision === 'discard' ? { decision } : { decision, email: editedEmail };

    const isAnswered = await answerAgentChatAsk({
      askId,
      toolCallId,
      response,
      // Only a discard is known before the server answers: sending or saving
      // can still fail.
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

    // The card goes once its Ask does, so it stays disabled until then.
    if (!isAnswered) {
      setPendingDecision(null);
    }
  };

  return (
    <StyledCard>
      <StyledHeader>{t`Review this email before it goes out`}</StyledHeader>
      <StyledFields>
        <AiChatEmailRecipientsRow
          label={t`To`}
          recipients={to}
          disabled={isAnswering}
          onChange={setTo}
          onFocus={handleFieldFocus}
          onBlur={handleFieldBlur}
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
            onFocus={handleFieldFocus}
            onBlur={handleFieldBlur}
          />
        )}
        {isBccShown && (
          <AiChatEmailRecipientsRow
            label={t`Bcc`}
            recipients={bcc}
            disabled={isAnswering}
            onChange={setBcc}
            onFocus={handleFieldFocus}
            onBlur={handleFieldBlur}
          />
        )}
        <StyledSubjectInput
          aria-label={t`Subject`}
          placeholder={t`Subject`}
          value={subject}
          disabled={isAnswering}
          onChange={(event) => setSubject(event.target.value)}
          onFocus={handleFieldFocus}
          onBlur={handleFieldBlur}
        />
        <StyledBodyTextarea
          aria-label={t`Email body`}
          minRows={4}
          maxRows={16}
          value={body}
          disabled={isAnswering}
          onChange={(event) => setBody(event.target.value)}
          onFocus={handleFieldFocus}
          onBlur={handleFieldBlur}
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
    </StyledCard>
  );
};
