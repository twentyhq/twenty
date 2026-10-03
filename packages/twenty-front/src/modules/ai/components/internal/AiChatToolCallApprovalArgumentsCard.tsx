import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { type ProposedToolCall } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import { LightButton } from 'twenty-ui/components';
import { IconCheck, IconX } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { type JsonValue } from 'type-fest';

import { StyledAiChatAskCard } from '@/ai/components/AiChatAskStyledComponents';
import { AiChatToolCallApprovalArgumentsEditor } from '@/ai/components/internal/AiChatToolCallApprovalArgumentsEditor';
import { AiChatToolCallApprovalFeedbackInput } from '@/ai/components/internal/AiChatToolCallApprovalFeedbackInput';
import { AiChatToolCallApprovalRecord } from '@/ai/components/internal/AiChatToolCallApprovalRecord';
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

type AiChatToolCallApprovalArgumentsCardProps = {
  toolCallId: string;
  proposal: ProposedToolCall;
};

export const AiChatToolCallApprovalArgumentsCard = ({
  toolCallId,
  proposal,
}: AiChatToolCallApprovalArgumentsCardProps) => {
  const { t } = useLingui();
  const { handleFieldFocus, handleFieldBlur } = useAiChatAskCardFieldFocus();
  const {
    pendingResponse,
    isAnswering,
    isFeedbackShown,
    showFeedback,
    feedback,
    setFeedback,
    approve,
    reject,
  } = useAnswerToolCallApproval({ toolCallId, proposal });

  // null while the raw arguments do not parse, which blocks approving
  const [toolArguments, setToolArguments] = useState<Record<
    string,
    unknown
  > | null>(proposal.arguments);

  const { template, objectNameSingular, recordId } = proposal;

  const handleRecordFieldChange = (fieldName: string, value: JsonValue) => {
    setToolArguments((previousArguments) => ({
      ...previousArguments,
      [fieldName]: value,
    }));
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
          <AiChatToolCallApprovalRecord
            objectNameSingular={objectNameSingular}
            recordId={recordId}
            isDeletion={template === 'recordDelete'}
          />
        )}
        {hasRecordFields && (
          <AiChatToolCallApprovalRecordFields
            objectNameSingular={objectNameSingular}
            values={toolArguments ?? proposal.arguments}
            recordId={recordId}
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
          <LightButton disabled={isAnswering} onClick={showFeedback}>
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
          onClick={() => {
            if (isDefined(toolArguments)) {
              approve({ arguments: toolArguments });
            }
          }}
        >
          {t`Approve`}
        </Button>
      </StyledToolCallApprovalActions>
    </StyledAiChatAskCard>
  );
};
