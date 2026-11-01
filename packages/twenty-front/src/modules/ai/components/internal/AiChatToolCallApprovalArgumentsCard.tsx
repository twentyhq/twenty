import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import {
  PUBLISH_FRONT_COMPONENT_TOOL_NAME,
  type ProposedToolCall,
} from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import { IconCheck, IconX } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { type JsonValue } from 'type-fest';

import { AiChatFrontComponentPreview } from '@/ai/components/AiChatFrontComponentPreview';
import { AiChatToolCallApprovalArgumentsEditor } from '@/ai/components/internal/AiChatToolCallApprovalArgumentsEditor';
import { AiChatToolCallApprovalCardLayout } from '@/ai/components/internal/AiChatToolCallApprovalCardLayout';
import { AiChatToolCallApprovalRecord } from '@/ai/components/internal/AiChatToolCallApprovalRecord';
import { AiChatToolCallApprovalRecordFields } from '@/ai/components/internal/AiChatToolCallApprovalRecordFields';
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
  const approval = useAnswerToolCallApproval({ toolCallId, proposal });
  const { pendingResponse, isAnswering, approve, reject } = approval;

  // null while the raw arguments do not parse, which blocks approving
  const [toolArguments, setToolArguments] = useState<Record<
    string,
    unknown
  > | null>(proposal.arguments);

  const { template, objectNameSingular, recordId } = proposal;
  const frontComponentDraftId =
    proposal.toolName === PUBLISH_FRONT_COMPONENT_TOOL_NAME &&
    isNonEmptyString(proposal.arguments.draftId)
      ? proposal.arguments.draftId
      : undefined;

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
      label={proposal.toolLabel}
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
          isDeletion={template === 'recordDelete'}
        />
      )}
      {hasRecordFields && (
        <AiChatToolCallApprovalRecordFields
          objectNameSingular={objectNameSingular}
          values={toolArguments ?? proposal.arguments}
          recordId={recordId}
          readonly={isAnswering || proposal.areArgumentsEditable === false}
          onChange={handleRecordFieldChange}
        />
      )}
      {template === 'generic' &&
        (isDefined(frontComponentDraftId) ? (
          <AiChatFrontComponentPreview draftId={frontComponentDraftId} />
        ) : (
          <AiChatToolCallApprovalArgumentsEditor
            defaultArguments={proposal.arguments}
            readonly={isAnswering || proposal.areArgumentsEditable === false}
            onChange={setToolArguments}
          />
        ))}
    </AiChatToolCallApprovalCardLayout>
  );
};
