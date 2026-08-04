import { styled } from '@linaria/react';

import { isNonEmptyString } from '@sniptt/guards';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { LazyMarkdownRenderer } from '@/ai/components/LazyMarkdownRenderer';
import { ReasoningSummaryDisplay } from '@/ai/components/ReasoningSummaryDisplay';
import { SettingsAdminChatToolCallPart } from '@/settings/admin-panel/components/SettingsAdminChatToolCallPart';
import { type AdminChatThreadMessagePart } from '@/settings/admin-panel/types/AdminChatThreadMessagePart';

type SettingsAdminChatMessagePartRendererProps = {
  part: AdminChatThreadMessagePart;
  isUserMessage: boolean;
};

const StyledTextContent = styled.div<{ isUser?: boolean }>`
  background: ${({ isUser }) =>
    isUser ? themeCssVariables.background.tertiary : 'transparent'};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${({ isUser }) =>
    isUser
      ? themeCssVariables.font.color.secondary
      : themeCssVariables.font.color.primary};
  font-weight: ${({ isUser }) => (isUser ? 500 : 400)};
  line-height: 1.4em;
  max-width: 100%;
  overflow-wrap: break-word;
  padding: ${({ isUser }) =>
    isUser ? `0 ${themeCssVariables.spacing[2]}` : '0'};
  white-space: ${({ isUser }) => (isUser ? 'pre-wrap' : 'normal')};
  width: ${({ isUser }) => (isUser ? 'fit-content' : '100%')};
`;

export const SettingsAdminChatMessagePartRenderer = ({
  part,
  isUserMessage,
}: SettingsAdminChatMessagePartRendererProps) => {
  if (part.type === 'text' && isNonEmptyString(part.textContent)) {
    return (
      <StyledTextContent isUser={isUserMessage}>
        {isUserMessage ? (
          part.textContent
        ) : (
          <LazyMarkdownRenderer text={part.textContent} />
        )}
      </StyledTextContent>
    );
  }

  if (part.type === 'reasoning' && isNonEmptyString(part.reasoningContent)) {
    return <ReasoningSummaryDisplay content={part.reasoningContent} />;
  }

  return <SettingsAdminChatToolCallPart part={part} />;
};
