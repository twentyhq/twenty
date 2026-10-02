import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type FocusEvent, useId, useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import {
  type ProposeToolCallToolResult,
  type ProposedToolCall,
  type ToolCallApprovalResponse,
} from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import { LightButton } from 'twenty-ui/components';
import { IconCheck, IconX } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';
import { type JsonValue } from 'type-fest';

import { StyledAiChatAskCard } from '@/ai/components/AiChatAskStyledComponents';
import { AiChatToolCallApprovalArgumentsEditor } from '@/ai/components/internal/AiChatToolCallApprovalArgumentsEditor';
import { AiChatToolCallApprovalRecordChip } from '@/ai/components/internal/AiChatToolCallApprovalRecordChip';
import { AiChatToolCallApprovalRecordFields } from '@/ai/components/internal/AiChatToolCallApprovalRecordFields';
import { useAnswerAgentChatToolCall } from '@/ai/hooks/useAnswerAgentChatToolCall';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';

const StyledHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing['0.5']};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]} 0;
`;

const StyledToolLabel = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledSummary = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledRecordRow = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  flex-wrap: wrap;
  font-size: ${themeCssVariables.font.size.md};
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledFeedbackTextarea = styled(TextareaAutosize)`
  background: transparent;
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.primary};
  font-family: inherit;
  font-size: ${themeCssVariables.font.size.md};
  line-height: 1.5;
  outline: none;
  padding: ${themeCssVariables.spacing[2]};
  resize: none;
`;

const StyledActions = styled.div`
  align-items: center;
  border-top: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: flex-end;
  padding: ${themeCssVariables.spacing[2]};
`;

const StyledActionsSpacer = styled.div`
  flex: 1;
`;

type AiChatToolCallApprovalCardProps = {
  toolCallId: string;
  proposal: ProposedToolCall;
};

export const AiChatToolCallApprovalCard = ({
  toolCallId,
  proposal,
}: AiChatToolCallApprovalCardProps) => {
  const { t } = useLingui();
  const focusId = useId();
  const { answerAgentChatToolCall } = useAnswerAgentChatToolCall();
  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();
  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();

  // null while the raw arguments do not parse, which blocks approving
  const [toolArguments, setToolArguments] = useState<Record<
    string,
    unknown
  > | null>(proposal.arguments);
  const [isFeedbackShown, setIsFeedbackShown] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [pendingDecision, setPendingDecision] = useState<
    ToolCallApprovalResponse['decision'] | null
  >(null);

  const isAnswering = pendingDecision !== null;
  const { template, objectNameSingular, recordId } = proposal;

  // Blocks page shortcuts while typing; buttons are excluded since one removed on click may never blur.
  const handleFieldFocus = (event: FocusEvent) => {
    if (
      !(event.target instanceof HTMLInputElement) &&
      !(event.target instanceof HTMLTextAreaElement) &&
      !(event.target instanceof HTMLElement && event.target.isContentEditable)
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

  const handleRecordFieldChange = (fieldName: string, value: JsonValue) => {
    setToolArguments((previousArguments) => ({
      ...previousArguments,
      [fieldName]: value,
    }));
  };

  const decide = async (decision: ToolCallApprovalResponse['decision']) => {
    if (decision === 'approve' && !isDefined(toolArguments)) {
      return;
    }

    setPendingDecision(decision);

    const trimmedFeedback = feedback.trim();
    const response: ToolCallApprovalResponse =
      decision === 'approve'
        ? { decision, arguments: toolArguments ?? proposal.arguments }
        : {
            decision,
            ...(trimmedFeedback.length > 0
              ? { feedback: trimmedFeedback }
              : {}),
          };

    const isAnswered = await answerAgentChatToolCall({
      toolCallId,
      response,
      // Only a rejection is certain before the server answers: the approved call can still fail.
      optimisticToolOutput:
        decision === 'reject'
          ? {
              success: true,
              result: {
                status: 'rejected',
                proposal,
                ...(trimmedFeedback.length > 0
                  ? { feedback: trimmedFeedback }
                  : {}),
              } satisfies ProposeToolCallToolResult,
            }
          : undefined,
    });

    // The card goes once its call is closed, so it stays disabled until then.
    if (!isAnswered) {
      setPendingDecision(null);
    }
  };

  const hasRecordFields =
    (template === 'recordCreate' || template === 'recordUpdate') &&
    isDefined(objectNameSingular);

  return (
    <StyledAiChatAskCard>
      <StyledHeader>
        <StyledToolLabel>{proposal.toolLabel}</StyledToolLabel>
        <StyledSummary>{proposal.summary}</StyledSummary>
      </StyledHeader>
      <StyledBody onFocus={handleFieldFocus} onBlur={handleFieldBlur}>
        {isDefined(objectNameSingular) && isDefined(recordId) && (
          <StyledRecordRow>
            {template === 'recordDelete'
              ? t`This record will be deleted:`
              : t`Record:`}
            <AiChatToolCallApprovalRecordChip
              objectNameSingular={objectNameSingular}
              recordId={recordId}
            />
          </StyledRecordRow>
        )}
        {hasRecordFields && (
          <AiChatToolCallApprovalRecordFields
            objectNameSingular={objectNameSingular}
            values={proposal.arguments}
            currentValues={proposal.currentValues}
            readonly={isAnswering}
            onChange={handleRecordFieldChange}
          />
        )}
        {template === 'generic' && (
          <AiChatToolCallApprovalArgumentsEditor
            defaultArguments={proposal.arguments}
            readonly={isAnswering}
            onChange={setToolArguments}
          />
        )}
        {isFeedbackShown && (
          <StyledFeedbackTextarea
            aria-label={t`Feedback`}
            placeholder={t`Tell the agent what to change`}
            minRows={2}
            maxRows={8}
            value={feedback}
            disabled={isAnswering}
            onChange={(event) => setFeedback(event.target.value)}
          />
        )}
      </StyledBody>
      <StyledActions>
        {!isFeedbackShown && (
          <LightButton
            disabled={isAnswering}
            onClick={() => setIsFeedbackShown(true)}
          >
            {t`Add feedback`}
          </LightButton>
        )}
        <StyledActionsSpacer />
        <Button
          size="sm"
          variant="ghost"
          startIcon={<IconX />}
          disabled={isAnswering}
          loading={pendingDecision === 'reject'}
          onClick={() => void decide('reject')}
        >
          {t`Reject`}
        </Button>
        <Button
          size="sm"
          variant="solid"
          color="accent"
          startIcon={<IconCheck />}
          disabled={isAnswering || !isDefined(toolArguments)}
          loading={pendingDecision === 'approve'}
          onClick={() => void decide('approve')}
        >
          {t`Approve`}
        </Button>
      </StyledActions>
    </StyledAiChatAskCard>
  );
};
