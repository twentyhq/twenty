import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { type ProposedToolCall } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import { type JsonValue } from 'type-fest';

import { AiChatToolFrontComponent } from '@/ai-chat/tool-calls/components/AiChatToolFrontComponent';
import { AiChatToolCallApprovalArgumentsEditor } from '@/ai-chat/tool-calls/components/AiChatToolCallApprovalArgumentsEditor';
import { AiChatToolCallApprovalCardLayout } from '@/ai-chat/tool-calls/components/AiChatToolCallApprovalCardLayout';
import { AiChatToolCallApprovalConfirmActions } from '@/ai-chat/tool-calls/components/AiChatToolCallApprovalConfirmActions';
import { AiChatToolCallApprovalDecisionActions } from '@/ai-chat/tool-calls/components/AiChatToolCallApprovalDecisionActions';
import { AiChatToolCallApprovalRecord } from '@/ai-chat/tool-calls/components/AiChatToolCallApprovalRecord';
import { AiChatToolCallApprovalRecordFields } from '@/ai-chat/tool-calls/components/AiChatToolCallApprovalRecordFields';
import { useAnswerToolCallApproval } from '@/ai-chat/tool-calls/hooks/useAnswerToolCallApproval';
import { useFrontComponentIdByToolName } from '@/ai-chat/tool-calls/hooks/useFrontComponentIdByToolName';

type AiChatToolCallApprovalArgumentsCardProps = {
  toolCallId: string;
  proposal: ProposedToolCall;
};

type AlternativeConfirmation = {
  toolName: string;
  argumentsBeforeConfirmation: Record<string, unknown> | null;
};

export const AiChatToolCallApprovalArgumentsCard = ({
  toolCallId,
  proposal,
}: AiChatToolCallApprovalArgumentsCardProps) => {
  const { t } = useLingui();
  const approval = useAnswerToolCallApproval({ toolCallId, proposal });
  const { pendingResponse, isAnswering, approve, reject } = approval;

  const [toolArguments, setToolArguments] = useState<Record<
    string,
    unknown
  > | null>(proposal.arguments);

  const [confirmation, setConfirmation] =
    useState<AlternativeConfirmation | null>(null);

  const {
    template,
    objectNameSingular,
    recordId,
    labels,
    alternativeToolNames = [],
  } = proposal;

  const frontComponentIdByToolName = useFrontComponentIdByToolName();
  const reviewedToolName = confirmation?.toolName ?? proposal.toolName;
  const toolFrontComponentId =
    frontComponentIdByToolName.get(reviewedToolName) ??
    frontComponentIdByToolName.get(proposal.toolName);
  const pendingToolName =
    pendingResponse?.decision === 'approve'
      ? (pendingResponse.toolName ?? proposal.toolName)
      : null;

  const approveWith = (toolName: string) => {
    if (!isDefined(toolArguments)) {
      return;
    }

    approve({
      ...(toolName !== proposal.toolName && { toolName }),
      arguments: toolArguments,
    });
  };

  const handleAlternativeClick = (alternativeToolName: string) => {
    if (isDefined(labels?.alternatives?.[alternativeToolName]?.confirmLabel)) {
      setConfirmation({
        toolName: alternativeToolName,
        argumentsBeforeConfirmation: toolArguments,
      });

      return;
    }

    approveWith(alternativeToolName);
  };

  const handleBackClick = () => {
    setToolArguments(confirmation?.argumentsBeforeConfirmation ?? null);
    setConfirmation(null);
  };

  const argumentsEditor = (
    <AiChatToolCallApprovalArgumentsEditor
      key={reviewedToolName}
      defaultArguments={toolArguments ?? proposal.arguments}
      readonly={isAnswering}
      onChange={setToolArguments}
    />
  );

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
    <AiChatToolCallApprovalCardLayout
      title={proposal.toolLabel}
      summary={proposal.summary}
      approval={approval}
      actions={
        isDefined(confirmation) ? (
          <AiChatToolCallApprovalConfirmActions
            confirmLabel={
              labels?.alternatives?.[confirmation.toolName]?.confirmLabel
            }
            isAnswering={isAnswering}
            isConfirmDisabled={!isDefined(toolArguments)}
            isConfirming={pendingToolName === confirmation.toolName}
            onBack={handleBackClick}
            onConfirm={() => approveWith(confirmation.toolName)}
          />
        ) : (
          <AiChatToolCallApprovalDecisionActions
            proposedToolName={proposal.toolName}
            alternativeToolNames={alternativeToolNames}
            labels={labels}
            pendingToolName={pendingToolName}
            isRejecting={pendingResponse?.decision === 'reject'}
            isAnswering={isAnswering}
            isApproveDisabled={!isDefined(toolArguments)}
            onReject={reject}
            onApprove={approveWith}
            onAlternativeClick={handleAlternativeClick}
          />
        )
      }
    >
      {isDefined(objectNameSingular) && isDefined(recordId) && (
        <AiChatToolCallApprovalRecord
          objectNameSingular={objectNameSingular}
          recordId={recordId}
          label={
            template === 'recordDelete'
              ? t`This record will be deleted:`
              : t`Record:`
          }
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
      {template === 'generic' &&
        !isDefined(toolFrontComponentId) &&
        argumentsEditor}
      {template === 'generic' && isDefined(toolFrontComponentId) && (
        <AiChatToolFrontComponent
          frontComponentId={toolFrontComponentId}
          toolCall={{
            toolCallId,
            toolName: reviewedToolName,
            status: isAnswering ? 'approval-responded' : 'approval-requested',
            input: toolArguments ?? proposal.arguments,
          }}
          onToolCallArgumentsChange={setToolArguments}
          unavailableFallback={argumentsEditor}
          errorFallback={argumentsEditor}
        />
      )}
    </AiChatToolCallApprovalCardLayout>
  );
};
