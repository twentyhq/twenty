import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { type ProposedToolCall } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import { LightButton } from 'twenty-ui/components';
import { IconCheck, IconX } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';
import { type JsonValue } from 'type-fest';

import { StyledAiChatAskCard } from '@/ai/components/AiChatAskStyledComponents';
import { AiChatToolCallApprovalArgumentsEditor } from '@/ai/components/internal/AiChatToolCallApprovalArgumentsEditor';
import { AiChatToolCallApprovalFeedbackInput } from '@/ai/components/internal/AiChatToolCallApprovalFeedbackInput';
import { AiChatToolCallApprovalRecordChip } from '@/ai/components/internal/AiChatToolCallApprovalRecordChip';
import { AiChatToolCallApprovalRecordFields } from '@/ai/components/internal/AiChatToolCallApprovalRecordFields';
import {
  StyledToolCallApprovalActions,
  StyledToolCallApprovalActionsSpacer,
  StyledToolCallApprovalBody,
  StyledToolCallApprovalHeader,
  StyledToolCallApprovalLabel,
  StyledToolCallApprovalSummary,
} from '@/ai/components/internal/AiChatToolCallApprovalStyledComponents';
import { useAiChatAskCardFieldFocus } from '@/ai/hooks/useAiChatAskCardFieldFocus';
import { useAnswerToolCallApproval } from '@/ai/hooks/useAnswerToolCallApproval';

const StyledRecordRow = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  flex-wrap: wrap;
  font-size: ${themeCssVariables.font.size.md};
  gap: ${themeCssVariables.spacing[1]};
`;

type AiChatToolCallApprovalArgumentsCardProps = {
  toolCallId: string;
  proposal: ProposedToolCall;
};

// record calls are edited field by field, any other tool as its raw arguments
export const AiChatToolCallApprovalArgumentsCard = ({
  toolCallId,
  proposal,
}: AiChatToolCallApprovalArgumentsCardProps) => {
  const { t } = useLingui();
  const { handleFieldFocus, handleFieldBlur } = useAiChatAskCardFieldFocus();
  const { pendingResponse, isAnswering, answerToolCallApproval } =
    useAnswerToolCallApproval({ toolCallId, proposal });

  // null while the raw arguments do not parse, which blocks approving
  const [toolArguments, setToolArguments] = useState<Record<
    string,
    unknown
  > | null>(proposal.arguments);
  const [isFeedbackShown, setIsFeedbackShown] = useState(false);
  const [feedback, setFeedback] = useState('');

  const { template, objectNameSingular, recordId } = proposal;

  const handleRecordFieldChange = (fieldName: string, value: JsonValue) => {
    setToolArguments((previousArguments) => ({
      ...previousArguments,
      [fieldName]: value,
    }));
  };

  const approve = () => {
    if (isDefined(toolArguments)) {
      void answerToolCallApproval({
        decision: 'approve',
        arguments: toolArguments,
      });
    }
  };

  const reject = () => {
    const trimmedFeedback = feedback.trim();

    void answerToolCallApproval({
      decision: 'reject',
      ...(trimmedFeedback.length > 0 ? { feedback: trimmedFeedback } : {}),
    });
  };

  const hasRecordFields =
    (template === 'recordCreate' || template === 'recordUpdate') &&
    isDefined(objectNameSingular);

  return (
    <StyledAiChatAskCard>
      <StyledToolCallApprovalHeader>
        <StyledToolCallApprovalLabel>
          {proposal.toolLabel}
        </StyledToolCallApprovalLabel>
        <StyledToolCallApprovalSummary>
          {proposal.summary}
        </StyledToolCallApprovalSummary>
      </StyledToolCallApprovalHeader>
      <StyledToolCallApprovalBody
        onFocus={handleFieldFocus}
        onBlur={handleFieldBlur}
      >
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
          <AiChatToolCallApprovalFeedbackInput
            value={feedback}
            disabled={isAnswering}
            onChange={setFeedback}
          />
        )}
      </StyledToolCallApprovalBody>
      <StyledToolCallApprovalActions>
        {!isFeedbackShown && (
          <LightButton
            disabled={isAnswering}
            onClick={() => setIsFeedbackShown(true)}
          >
            {t`Add feedback`}
          </LightButton>
        )}
        <StyledToolCallApprovalActionsSpacer />
        <Button
          size="sm"
          variant="ghost"
          startIcon={<IconX />}
          disabled={isAnswering}
          loading={pendingResponse?.decision === 'reject'}
          onClick={reject}
        >
          {t`Reject`}
        </Button>
        <Button
          size="sm"
          variant="solid"
          color="accent"
          startIcon={<IconCheck />}
          disabled={isAnswering || !isDefined(toolArguments)}
          loading={pendingResponse?.decision === 'approve'}
          onClick={approve}
        >
          {t`Approve`}
        </Button>
      </StyledToolCallApprovalActions>
    </StyledAiChatAskCard>
  );
};
