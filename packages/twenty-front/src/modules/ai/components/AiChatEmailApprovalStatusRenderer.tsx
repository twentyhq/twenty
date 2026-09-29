import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { type DynamicToolUIPart, type ToolUIPart } from 'ai';
import {
  type ProposeEmailToolResult,
  type ProposeEmailToolStatus,
} from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import { IconMail } from 'twenty-ui/icon';
import { useTheme, themeCssVariables } from 'twenty-ui/theme';

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

export const AiChatEmailApprovalStatusRenderer = ({
  toolPart,
  isStreaming,
}: {
  toolPart: ToolUIPart | DynamicToolUIPart;
  isStreaming: boolean;
}) => {
  const { t } = useLingui();
  const theme = useTheme();

  const result = (
    toolPart.output as { result?: ProposeEmailToolResult } | null | undefined
  )?.result;
  const status: ProposeEmailToolStatus = result?.status ?? 'pending';

  const messageByStatus: Record<ProposeEmailToolStatus, string> = {
    pending: isDefined(result)
      ? t`Email waiting for your review`
      : t`Drafting an email...`,
    sent: t`Email sent`,
    drafted: t`Email saved as draft`,
    discarded: t`Email discarded`,
    failed: t`Email could not go through`,
    skipped: t`Email skipped`,
  };
  const message = messageByStatus[status];

  const recipients = result?.email.recipients.to;
  const subject = result?.email.subject;
  const hasEmailDetail =
    (status === 'sent' || status === 'drafted') &&
    isNonEmptyString(subject) &&
    isNonEmptyString(recipients);

  return (
    <StyledAiChatAskStatusContainer>
      <IconMail size={theme.icon.size.sm} />
      <StyledContent>
        {isStreaming && status === 'pending' ? (
          <ShimmeringText>
            <StyledAiChatAskStatusMessage>
              {message}
            </StyledAiChatAskStatusMessage>
          </ShimmeringText>
        ) : (
          <StyledAiChatAskStatusMessage>{message}</StyledAiChatAskStatusMessage>
        )}
        {hasEmailDetail && (
          <StyledDetail>{t`"${subject}" to ${recipients}`}</StyledDetail>
        )}
        {status === 'failed' && isNonEmptyString(result?.error) && (
          <StyledDetail>{result.error}</StyledDetail>
        )}
      </StyledContent>
    </StyledAiChatAskStatusContainer>
  );
};
