import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { type DynamicToolUIPart, type ToolUIPart } from 'ai';
import {
  type ProposeToolCallToolResult,
  type ProposeToolCallToolStatus,
} from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import { IconAlertTriangle, IconMail, IconTool } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';

import { ThinkingStepRowLayout } from '@/ai-chat/thinking-steps/components/ThinkingStepRowLayout';
import { AiChatAskStatusRow } from '@/ai-chat/tool-calls/components/AiChatAskStatusRow';
import { AiChatToolCallApprovalDecidedDetails } from '@/ai-chat/tool-calls/components/AiChatToolCallApprovalDecidedDetails';
import { StyledAiChatAskStatusDetail } from '@/ai-chat/tool-calls/components/StyledAiChatAskStatusDetail';
import { useIsAiChatToolCallAskedInComposer } from '@/ai-chat/tool-calls/hooks/useIsAiChatToolCallAskedInComposer';
import { TextWithChatReferences } from '@/ai-chat/message-content/components/TextWithChatReferences';
import { getChatReferencePlainText } from '@/ai-chat/message-content/utils/getChatReferencePlainText';
import { getToolIcon } from '@/ai/utils/getToolIcon';

const IS_FAILURE_BY_DECIDED_APPROVAL_STATUS = {
  approved: false,
  rejected: false,
  failed: true,
  conflict: true,
} as const satisfies Partial<Record<ProposeToolCallToolStatus, boolean>>;

type DecidedApprovalStatus = keyof typeof IS_FAILURE_BY_DECIDED_APPROVAL_STATUS;

const isDecidedApprovalStatus = (
  status: ProposeToolCallToolStatus,
): status is DecidedApprovalStatus =>
  status in IS_FAILURE_BY_DECIDED_APPROVAL_STATUS;

export const AiChatToolCallApprovalStatusRenderer = ({
  toolPart,
  isStreaming,
}: {
  toolPart: ToolUIPart | DynamicToolUIPart;
  isStreaming: boolean;
}) => {
  const { t } = useLingui();
  const isAskedInComposer = useIsAiChatToolCallAskedInComposer(
    toolPart.toolCallId,
  );

  if (isAskedInComposer) {
    return null;
  }

  const output = toolPart.output as
    | { result?: ProposeToolCallToolResult; error?: string }
    | null
    | undefined;
  const result = output?.result;

  if (!isDefined(result)) {
    const hasFailedToPropose =
      toolPart.state === 'output-error' || isDefined(output);

    if (!hasFailedToPropose) {
      return (
        <AiChatAskStatusRow
          Icon={IconTool}
          message={t`Preparing an action to approve...`}
          isShimmering={isStreaming}
        />
      );
    }

    const proposeErrorText =
      toolPart.state === 'output-error' ? toolPart.errorText : output?.error;

    return (
      <AiChatAskStatusRow
        Icon={IconTool}
        message={t`Could not be proposed`}
        isShimmering={false}
      >
        {isNonEmptyString(proposeErrorText) && (
          <StyledAiChatAskStatusDetail>
            <TextWithChatReferences text={proposeErrorText} />
          </StyledAiChatAskStatusDetail>
        )}
      </AiChatAskStatusRow>
    );
  }

  const { status, proposal } = result;

  if (isDecidedApprovalStatus(status)) {
    const hasFailed = IS_FAILURE_BY_DECIDED_APPROVAL_STATUS[status];
    const decidedDetailByStatus: Record<
      DecidedApprovalStatus,
      string | undefined
    > = {
      approved: undefined,
      rejected: t`Rejected`,
      failed: t`Failed`,
      conflict: t`Not run: the record changed`,
    };
    const ToolIcon = getToolIcon(proposal.toolName);

    return (
      <ThinkingStepRowLayout
        icon={
          hasFailed ? (
            <IconAlertTriangle
              size={14}
              color={themeCssVariables.font.color.danger}
            />
          ) : (
            <ToolIcon size={14} />
          )
        }
        label={getChatReferencePlainText(proposal.summary)}
        detail={decidedDetailByStatus[status]}
        isActive={false}
        isError={hasFailed}
        details={
          <AiChatToolCallApprovalDecidedDetails
            toolCallId={toolPart.toolCallId}
            result={result}
          />
        }
      />
    );
  }

  const messageByStatus: Record<
    Exclude<ProposeToolCallToolStatus, DecidedApprovalStatus>,
    string
  > = {
    pending: t`Waiting for your approval`,
    running: t`Running...`,
    skipped: t`Skipped`,
  };

  return (
    <AiChatAskStatusRow
      Icon={proposal.template === 'email' ? IconMail : IconTool}
      message={messageByStatus[status]}
      isShimmering={
        (isStreaming && status === 'pending') || status === 'running'
      }
    >
      {isNonEmptyString(proposal.summary) && (
        <StyledAiChatAskStatusDetail>
          <TextWithChatReferences text={proposal.summary} />
        </StyledAiChatAskStatusDetail>
      )}
    </AiChatAskStatusRow>
  );
};
