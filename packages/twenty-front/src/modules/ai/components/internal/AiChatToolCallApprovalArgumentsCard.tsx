import { AiChatFrontComponentPreview } from '@/ai/components/AiChatFrontComponentPreview';
import { isString } from '@sniptt/guards';
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
import { useAnswerToolCallApproval } from '@/ai/hooks/useAnswerToolCallApproval';
import { useRefreshFrontComponents } from '@/ai/hooks/useRefreshFrontComponents';

type AiChatToolCallApprovalArgumentsCardProps = {
  toolCallId: string;
  proposal: ProposedToolCall;
};

export const AiChatToolCallApprovalArgumentsCard = ({
  toolCallId,
  proposal,
}: AiChatToolCallApprovalArgumentsCardProps) => {
  const { t } = useLingui();
  const { refreshFrontComponents } = useRefreshFrontComponents();
  const approval = useAnswerToolCallApproval({
    toolCallId,
    proposal,
    onApproved: async () => {
      if (proposal.template === 'frontComponent') {
        await refreshFrontComponents();
      }
    },
  });
  const { pendingResponse, isAnswering, approve, reject } = approval;

  // null while the raw arguments do not parse, which blocks approving
  const [toolArguments, setToolArguments] = useState<Record<
    string,
    unknown
  > | null>(proposal.arguments);

  const { template, objectNameSingular, recordId } = proposal;
  const [isPreviewReady, setIsPreviewReady] = useState(false);

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
      hideHeader={template === 'frontComponent'}
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
            disabled={
              isAnswering ||
              !isDefined(toolArguments) ||
              (template === 'frontComponent' && !isPreviewReady)
            }
            loading={pendingResponse?.decision === 'approve'}
            onClick={() => {
              if (isDefined(toolArguments)) {
                approve({ arguments: toolArguments });
              }
            }}
          >
            {template === 'frontComponent'
              ? t`Save to Workspace app`
              : t`Approve`}
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
      {template === 'frontComponent' &&
        isString(proposal.arguments.draftId) && (
          <AiChatFrontComponentPreview
            key={proposal.arguments.draftId}
            draftId={proposal.arguments.draftId}
            onReadyChange={setIsPreviewReady}
          />
        )}
      {template === 'generic' && (
        <AiChatToolCallApprovalArgumentsEditor
          defaultArguments={proposal.arguments}
          readonly={isAnswering}
          onChange={setToolArguments}
        />
      )}
    </AiChatToolCallApprovalCardLayout>
  );
};
