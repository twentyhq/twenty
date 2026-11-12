import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { type ProposedToolCall } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import { IconCheck, IconX } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { type JsonValue } from 'type-fest';

import { AiChatToolCallApprovalArgumentsEditor } from '@/ai/components/internal/AiChatToolCallApprovalArgumentsEditor';
import { AiChatToolCallApprovalCardLayout } from '@/ai/components/internal/AiChatToolCallApprovalCardLayout';
import { AiChatToolCallApprovalRecord } from '@/ai/components/internal/AiChatToolCallApprovalRecord';
import { AiChatToolCallApprovalRecordFields } from '@/ai/components/internal/AiChatToolCallApprovalRecordFields';
import { AiChatToolCallApprovalToolFrontComponent } from '@/ai/components/internal/AiChatToolCallApprovalToolFrontComponent';
import { useAnswerToolCallApproval } from '@/ai/hooks/useAnswerToolCallApproval';
import { useFrontComponentIdByToolName } from '@/ai/hooks/useFrontComponentIdByToolName';

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

  // null while the raw arguments do not parse, which blocks approving
  const [toolArguments, setToolArguments] = useState<Record<
    string,
    unknown
  > | null>(proposal.arguments);

  const { template, objectNameSingular, recordId } = proposal;

  const toolFrontComponentId = useFrontComponentIdByToolName().get(
    proposal.toolName,
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
        <>
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
        </>
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
      {template === 'generic' && !isDefined(toolFrontComponentId) && (
        <AiChatToolCallApprovalArgumentsEditor
          defaultArguments={proposal.arguments}
          readonly={isAnswering}
          onChange={setToolArguments}
        />
      )}
      {template === 'generic' && isDefined(toolFrontComponentId) && (
        <AiChatToolCallApprovalToolFrontComponent
          frontComponentId={toolFrontComponentId}
          toolCallId={toolCallId}
          toolName={proposal.toolName}
          toolArguments={toolArguments ?? proposal.arguments}
          isAnswering={isAnswering}
          onToolArgumentsChange={setToolArguments}
          unavailableFallback={
            <AiChatToolCallApprovalArgumentsEditor
              defaultArguments={proposal.arguments}
              readonly={isAnswering}
              onChange={setToolArguments}
            />
          }
        />
      )}
    </AiChatToolCallApprovalCardLayout>
  );
};
