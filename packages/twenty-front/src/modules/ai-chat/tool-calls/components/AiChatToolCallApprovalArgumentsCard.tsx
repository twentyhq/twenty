import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { type ProposedToolCall } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import { IconCheck, IconX } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { type JsonValue } from 'type-fest';

import { AiChatToolFrontComponent } from '@/ai-chat/tool-calls/components/AiChatToolFrontComponent';
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

  const [confirmingToolName, setConfirmingToolName] = useState<string | null>(
    null,
  );

  const {
    template,
    objectNameSingular,
    recordId,
    labels,
    alternativeToolNames = [],
  } = proposal;

  const frontComponentIdByToolName = useFrontComponentIdByToolName();
  const reviewedToolName = confirmingToolName ?? proposal.toolName;
  const toolFrontComponentId =
    frontComponentIdByToolName.get(reviewedToolName) ??
    frontComponentIdByToolName.get(proposal.toolName);
  const confirmLabel = isDefined(confirmingToolName)
    ? labels?.alternatives?.[confirmingToolName]?.confirmLabel
    : undefined;
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
      setConfirmingToolName(alternativeToolName);

      return;
    }

    approveWith(alternativeToolName);
  };

  const argumentsEditor = (
    <AiChatToolCallApprovalArgumentsEditor
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
        isDefined(confirmingToolName) ? (
          <>
            <Button
              size="sm"
              variant="ghost"
              disabled={isAnswering}
              onClick={() => setConfirmingToolName(null)}
            >
              {t`Back`}
            </Button>
            <Button
              size="sm"
              variant="solid"
              color="accent"
              startIcon={<IconCheck />}
              disabled={isAnswering || !isDefined(toolArguments)}
              loading={pendingToolName === confirmingToolName}
              onClick={() => approveWith(confirmingToolName)}
            >
              {confirmLabel ?? t`Approve`}
            </Button>
          </>
        ) : (
          <>
            <Button
              size="sm"
              variant="ghost"
              startIcon={<IconX />}
              disabled={isAnswering}
              loading={pendingResponse?.decision === 'reject'}
              onClick={reject}
            >
              {labels?.reject ?? t`Reject`}
            </Button>
            {alternativeToolNames.map((alternativeToolName) => {
              const alternativeLabel =
                labels?.alternatives?.[alternativeToolName];

              return (
                <Button
                  key={alternativeToolName}
                  size="sm"
                  variant="outline"
                  disabled={isAnswering || !isDefined(toolArguments)}
                  loading={pendingToolName === alternativeToolName}
                  onClick={() => handleAlternativeClick(alternativeToolName)}
                >
                  {isDefined(alternativeLabel?.confirmLabel)
                    ? `${alternativeLabel.label}…`
                    : (alternativeLabel?.label ?? alternativeToolName)}
                </Button>
              );
            })}
            <Button
              size="sm"
              variant="solid"
              color="accent"
              startIcon={<IconCheck />}
              disabled={isAnswering || !isDefined(toolArguments)}
              loading={pendingToolName === proposal.toolName}
              onClick={() => approveWith(proposal.toolName)}
            >
              {labels?.approve ?? t`Approve`}
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
