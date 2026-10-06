import { useLingui } from '@lingui/react/macro';
import { isUndefined } from '@sniptt/guards';
import { type ProposedToolCall } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import { IconCheck, IconX } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { type JsonValue } from 'type-fest';

import { AiChatToolWidget } from '@/ai/components/AiChatToolWidget';
import { AiChatToolCallApprovalArgumentsEditor } from '@/ai/components/internal/AiChatToolCallApprovalArgumentsEditor';
import { AiChatToolCallApprovalCardLayout } from '@/ai/components/internal/AiChatToolCallApprovalCardLayout';
import { AiChatToolCallApprovalRecord } from '@/ai/components/internal/AiChatToolCallApprovalRecord';
import { AiChatToolCallApprovalRecordFields } from '@/ai/components/internal/AiChatToolCallApprovalRecordFields';
import { useAnswerToolCallApproval } from '@/ai/hooks/useAnswerToolCallApproval';
import { useFrontComponentIdByToolName } from '@/ai/hooks/useFrontComponentIdByToolName';
import { useGetToolIndex } from '@/ai/hooks/useGetToolIndex';
import { agentChatToolCallArgumentsFamilyState } from '@/ai/states/agentChatToolCallArgumentsFamilyState';
import { FrontComponentSkeletonLoader } from '@/front-components/components/FrontComponentSkeletonLoader';
import { useAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyState';

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

  // shared with the tool's own front component, which edits them through the host
  const [stagedArguments, setStagedArguments] = useAtomFamilyState(
    agentChatToolCallArgumentsFamilyState,
    toolCallId,
  );
  const toolArguments = isUndefined(stagedArguments)
    ? proposal.arguments
    : stagedArguments;

  const { loading: isToolIndexLoading } = useGetToolIndex();
  const frontComponentId = useFrontComponentIdByToolName().get(
    proposal.toolName,
  );

  const { template, objectNameSingular, recordId } = proposal;

  const handleRecordFieldChange = (fieldName: string, value: JsonValue) => {
    setStagedArguments((previousArguments) => ({
      ...(previousArguments ?? proposal.arguments),
      [fieldName]: value,
    }));
  };

  const argumentsEditor = (
    <AiChatToolCallApprovalArgumentsEditor
      defaultArguments={proposal.arguments}
      readonly={isAnswering}
      onChange={setStagedArguments}
    />
  );

  // the editor is only known once the tool index loads, so nothing is edited in one that gets replaced
  const renderGenericArgumentsEditor = () => {
    if (isToolIndexLoading) {
      return <FrontComponentSkeletonLoader />;
    }

    if (!isDefined(frontComponentId)) {
      return argumentsEditor;
    }

    return (
      <AiChatToolWidget
        toolCall={{
          toolCallId,
          toolName: proposal.toolName,
          status: 'approval-requested',
          input: proposal.arguments,
        }}
        frontComponentId={frontComponentId}
        unavailableFallback={argumentsEditor}
      />
    );
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
          readonly={isAnswering}
          onChange={handleRecordFieldChange}
        />
      )}
      {template === 'generic' && renderGenericArgumentsEditor()}
    </AiChatToolCallApprovalCardLayout>
  );
};
