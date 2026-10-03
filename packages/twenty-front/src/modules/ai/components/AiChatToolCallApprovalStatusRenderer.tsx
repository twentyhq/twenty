import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString, isString } from '@sniptt/guards';
import { type DynamicToolUIPart, type ToolUIPart } from 'ai';
import {
  type ProposeToolCallToolResult,
  type ProposeToolCallToolStatus,
} from 'twenty-shared/ai';
import { isDefined, isPlainObject } from 'twenty-shared/utils';
import { IconMail, IconTool } from 'twenty-ui/icon';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

import {
  StyledAiChatAskStatusContainer,
  StyledAiChatAskStatusMessage,
} from '@/ai/components/AiChatAskStyledComponents';
import { ShimmeringText } from '@/ai/components/ShimmeringText';
import { EMAIL_TOOL_NAMES } from '@/ai/constants/EmailToolNames';

const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing['0.5']};
  min-width: 0;
`;

const StyledDetail = styled.span`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  overflow-wrap: anywhere;
`;

export const AiChatToolCallApprovalStatusRenderer = ({
  toolPart,
  isStreaming,
}: {
  toolPart: ToolUIPart | DynamicToolUIPart;
  isStreaming: boolean;
}) => {
  const { t } = useLingui();
  const theme = useTheme();

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

  // the input names the tool before the proposal is resolved
  const proposedToolName = isPlainObject(toolPart.input)
    ? toolPart.input.toolName
    : undefined;
  const isEmail = isDefined(result)
    ? result.proposal.template === 'email'
    : isString(proposedToolName) &&
      Object.values<string>(EMAIL_TOOL_NAMES).includes(proposedToolName);

  const messageByStatus: Record<ProposeToolCallToolStatus, string> = isEmail
    ? {
        pending: isDefined(result)
          ? t`Email waiting for your review`
          : t`Drafting an email...`,
        approved:
          result?.proposal.toolName === EMAIL_TOOL_NAMES.draft
            ? t`Email saved as draft`
            : t`Email sent`,
        rejected: t`Email discarded`,
        failed: t`Email could not go through`,
        conflict: t`Email not sent`,
        skipped: t`Email skipped`,
      }
    : {
        pending: isDefined(result)
          ? t`Action waiting for your approval`
          : t`Preparing an action to approve...`,
        approved: t`Action approved`,
        rejected: t`Action rejected`,
        failed: t`Action approved but it failed`,
        conflict: t`Action not run: the record changed since it was proposed`,
        skipped: t`Action skipped`,
      };
  const message = hasFailedToPropose
    ? isEmail
      ? t`Email could not be proposed`
      : t`Action could not be proposed`
    : messageByStatus[status];

  const summary = result?.proposal.summary;
  const detailByStatus: Record<ProposeToolCallToolStatus, string | undefined> =
    {
      pending: summary,
      approved: summary,
      rejected: result?.feedback,
      failed: result?.error,
      conflict: summary,
      skipped: summary,
    };
  const detail = hasFailedToPropose ? proposeErrorText : detailByStatus[status];

  return (
    <StyledAiChatAskStatusContainer>
      {isEmail ? (
        <IconMail size={theme.icon.size.sm} />
      ) : (
        <IconTool size={theme.icon.size.sm} />
      )}
      <StyledContent>
        {isStreaming && status === 'pending' && !hasFailedToPropose ? (
          <ShimmeringText>
            <StyledAiChatAskStatusMessage>
              {message}
            </StyledAiChatAskStatusMessage>
          </ShimmeringText>
        ) : (
          <StyledAiChatAskStatusMessage>{message}</StyledAiChatAskStatusMessage>
        )}
        {isNonEmptyString(detail) && <StyledDetail>{detail}</StyledDetail>}
      </StyledContent>
    </StyledAiChatAskStatusContainer>
  );
};
