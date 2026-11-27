import { useLingui } from '@lingui/react/macro';
import { useCallback, useState } from 'react';
import { type ToolCallApprovalCard } from 'twenty-sdk/front-component';
import { type ProposedToolCall } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import { IconCheck, IconTool, IconX } from 'twenty-ui/icon';
import { useIcons } from 'twenty-ui/icon/provider';
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
import { useGetToolIndex } from '@/ai/hooks/useGetToolIndex';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';

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

  const { getIcon } = useIcons();
  const { objectMetadataItems } = useObjectMetadataItems();
  const objectIconName = objectMetadataItems.find(
    (objectMetadataItem) =>
      objectMetadataItem.nameSingular === objectNameSingular,
  )?.icon;
  const TitleIcon = isDefined(objectIconName)
    ? getIcon(objectIconName)
    : IconTool;

  const toolFrontComponentId = useFrontComponentIdByToolName().get(
    proposal.toolName,
  );
  const { loading: isToolIndexLoading } = useGetToolIndex();

  const [approvalCard, setApprovalCard] = useState<
    ToolCallApprovalCard | undefined
  >();
  const [isFrontComponentReady, setIsFrontComponentReady] = useState(false);

  const handleFrontComponentReady = useCallback(
    () => setIsFrontComponentReady(true),
    [],
  );

  const isWaitingForFrontComponent =
    template === 'generic' &&
    (isDefined(toolFrontComponentId)
      ? !isFrontComponentReady
      : isToolIndexLoading);

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

  const getHeader = () => {
    if (isWaitingForFrontComponent) {
      return { title: '', Icon: undefined, summary: undefined };
    }

    if (!isDefined(approvalCard)) {
      return {
        title: proposal.toolLabel,
        Icon: TitleIcon,
        summary: proposal.summary,
      };
    }

    return {
      title: approvalCard.title ?? proposal.toolLabel,
      Icon: TitleIcon,
      summary: approvalCard.subtitle,
    };
  };

  const header = getHeader();

  return (
    <AiChatToolCallApprovalCardLayout
      title={header.title}
      Icon={header.Icon}
      summary={header.summary}
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
              {approvalCard?.rejectLabel ?? t`Reject`}
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
              {approvalCard?.approveLabel ?? t`Approve`}
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
          onToolCallApprovalCardChange={setApprovalCard}
          onReady={handleFrontComponentReady}
          unavailableFallback={frontComponentFallback}
          errorFallback={frontComponentFallback}
        />
      )}
    </AiChatToolCallApprovalCardLayout>
  );
};
