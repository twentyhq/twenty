import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { type DynamicToolUIPart, type ToolUIPart } from 'ai';
import {
  type ProposeToolCallToolResult,
  type ProposeToolCallToolStatus,
} from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import { IconMail, IconTool } from 'twenty-ui/icon';

import { AiChatAskStatusRow } from '@/ai/components/AiChatAskStatusRow';
import { StyledAiChatAskStatusDetail } from '@/ai/components/AiChatAskStyledComponents';
import { TextWithChatReferences } from '@/ai/components/TextWithChatReferences';

export const AiChatToolCallApprovalStatusRenderer = ({
  toolPart,
  isStreaming,
}: {
  toolPart: ToolUIPart | DynamicToolUIPart;
  isStreaming: boolean;
}) => {
  const { t } = useLingui();

  const output = toolPart.output as
    | { result?: ProposeToolCallToolResult; error?: string }
    | null
    | undefined;
  const result = output?.result;
  const status: ProposeToolCallToolStatus = result?.status ?? 'pending';
  // refused when proposed, or failing outright, the call never reached the person
  const hasFailedToPropose =
    toolPart.state === 'output-error' ||
    (isDefined(output) && !isDefined(result));
  const proposeErrorText =
    toolPart.state === 'output-error' ? toolPart.errorText : output?.error;

  const messageByStatus: Record<ProposeToolCallToolStatus, string> = {
    pending: isDefined(result)
      ? t`Waiting for your approval`
      : t`Preparing an action to approve...`,
    running: t`Running...`,
    approved: t`Approved`,
    rejected: t`Rejected`,
    failed: t`Approved but it failed`,
    conflict: t`Not run: the record changed since it was proposed`,
    skipped: t`Skipped`,
  };
  const message = hasFailedToPropose
    ? t`Could not be proposed`
    : messageByStatus[status];

  const summary = result?.proposal.summary;
  const detailByStatus: Record<ProposeToolCallToolStatus, string | undefined> =
    {
      pending: summary,
      running: summary,
      approved: summary,
      rejected: result?.feedback,
      failed: result?.error,
      conflict: summary,
      skipped: summary,
    };
  const detail = hasFailedToPropose ? proposeErrorText : detailByStatus[status];

  return (
    <AiChatAskStatusRow
      Icon={result?.proposal.template === 'email' ? IconMail : IconTool}
      message={message}
      isShimmering={
        ((isStreaming && status === 'pending') || status === 'running') &&
        !hasFailedToPropose
      }
    >
      {isNonEmptyString(detail) && (
        <StyledAiChatAskStatusDetail>
          <TextWithChatReferences text={detail} />
        </StyledAiChatAskStatusDetail>
      )}
    </AiChatAskStatusRow>
  );
};
