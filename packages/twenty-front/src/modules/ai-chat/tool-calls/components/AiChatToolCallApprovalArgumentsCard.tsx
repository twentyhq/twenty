import { useLingui } from '@lingui/react/macro';
import { useCallback, useState } from 'react';
import { type ToolCallApprovalLabels } from 'twenty-sdk/front-component';
import { type ProposedToolCall } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import { IconCheck, IconX } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { type JsonValue } from 'type-fest';

import { AiChatToolFrontComponent } from '@/ai-chat/tool-calls/components/AiChatToolFrontComponent';
import { AiChatToolFrontComponentFallbackEffect } from '@/ai-chat/tool-calls/components/AiChatToolFrontComponentFallbackEffect';
import { AiChatToolCallApprovalArgumentsEditor } from '@/ai-chat/tool-calls/components/AiChatToolCallApprovalArgumentsEditor';
import { AiChatToolCallApprovalCardLayout } from '@/ai-chat/tool-calls/components/AiChatToolCallApprovalCardLayout';
import { AiChatToolCallApprovalRecord } from '@/ai-chat/tool-calls/components/AiChatToolCallApprovalRecord';
import { AiChatToolCallApprovalRecordFields } from '@/ai-chat/tool-calls/components/AiChatToolCallApprovalRecordFields';
import { useAnswerToolCallApproval } from '@/ai-chat/tool-calls/hooks/useAnswerToolCallApproval';
import { useFrontComponentIdByToolName } from '@/ai-chat/tool-calls/hooks/useFrontComponentIdByToolName';

type AiChatToolCallApprovalArgumentsCardProps = {
  toolCallId: string;
  proposal: ProposedToolCall;
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

  const { template, objectNameSingular, recordId } = proposal;

  const toolFrontComponentId = useFrontComponentIdByToolName().get(
    proposal.toolName,
  );

  const [approvalLabels, setApprovalLabels] = useState<ToolCallApprovalLabels>(
    {},
  );
  const [isFrontComponentReady, setIsFrontComponentReady] = useState(false);

  const handleFrontComponentReady = useCallback(
    () => setIsFrontComponentReady(true),
    [],
  );

  const isWaitingForFrontComponent =
    template === 'generic' &&
    isDefined(toolFrontComponentId) &&
    !isFrontComponentReady;

  const argumentsEditor = (
    <AiChatToolCallApprovalArgumentsEditor
      defaultArguments={toolArguments ?? proposal.arguments}
      readonly={isAnswering}
      onChange={setToolArguments}
    />
  );

  const frontComponentFallback = (
    <>
      {argumentsEditor}
      <AiChatToolFrontComponentFallbackEffect
        onFallback={handleFrontComponentReady}
      />
    </>
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
        !isWaitingForFrontComponent && (
          <>
            <Button
              size="sm"
              variant="ghost"
              startIcon={<IconX />}
              disabled={isAnswering}
              loading={pendingResponse?.decision === 'reject'}
              onClick={reject}
            >
              {approvalLabels.reject ?? t`Reject`}
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
              {approvalLabels.approve ?? t`Approve`}
            </Button>
          </>
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
            toolName: proposal.toolName,
            status: isAnswering ? 'approval-responded' : 'approval-requested',
            input: toolArguments ?? proposal.arguments,
          }}
          onToolCallArgumentsChange={setToolArguments}
          onToolCallApprovalLabelsChange={setApprovalLabels}
          onReady={handleFrontComponentReady}
          unavailableFallback={frontComponentFallback}
          errorFallback={frontComponentFallback}
        />
      )}
    </AiChatToolCallApprovalCardLayout>
  );
};
