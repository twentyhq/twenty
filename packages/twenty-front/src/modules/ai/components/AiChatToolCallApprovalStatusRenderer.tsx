import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { type DynamicToolUIPart, type ToolUIPart } from 'ai';
import {
  type ProposeToolCallToolResult,
  type ProposeToolCallToolStatus,
} from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import { IconTool } from 'twenty-ui/icon';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

import {
  StyledAiChatAskStatusContainer,
  StyledAiChatAskStatusMessage,
} from '@/ai/components/AiChatAskStyledComponents';
import { ShimmeringText } from '@/ai/components/ShimmeringText';

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
  const isRefused = isDefined(output) && !isDefined(result);

  const messageByStatus: Record<ProposeToolCallToolStatus, string> = {
    pending: isDefined(result)
      ? t`Action waiting for your approval`
      : t`Preparing an action to approve...`,
    approved: t`Action approved`,
    rejected: t`Action rejected`,
    failed: t`Action approved but it failed`,
    conflict: t`Action not run: the record changed since it was proposed`,
    skipped: t`Action skipped`,
  };
  const message = isRefused
    ? t`Action could not be proposed`
    : messageByStatus[status];

  const detail =
    status === 'failed'
      ? result?.error
      : status === 'rejected'
        ? result?.feedback
        : result?.proposal.summary;

  return (
    <StyledAiChatAskStatusContainer>
      <IconTool size={theme.icon.size.sm} />
      <StyledContent>
        {isStreaming && status === 'pending' && !isRefused ? (
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
