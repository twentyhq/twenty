import { t } from '@lingui/core/macro';
import { styled } from '@linaria/react';

import { isNonEmptyString } from '@sniptt/guards';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { LazyMarkdownRenderer } from '@/ai/components/LazyMarkdownRenderer';
import { SettingsAdminChatCollapsibleSection } from '@/settings/admin-panel/components/SettingsAdminChatCollapsibleSection';
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
  font-weight: ${({ isUser }) =>
    isUser
      ? themeCssVariables.font.weight.medium
      : themeCssVariables.font.weight.regular};
  line-height: 1.4em;
  max-width: 100%;
  overflow-wrap: break-word;
  padding: ${({ isUser }) =>
    isUser ? `0 ${themeCssVariables.spacing[2]}` : '0'};
  white-space: ${({ isUser }) => (isUser ? 'pre-wrap' : 'normal')};
  width: ${({ isUser }) => (isUser ? 'fit-content' : '100%')};
`;

const StyledReasoningContent = styled.div`
  background: ${themeCssVariables.background.transparent.lighter};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  padding: ${themeCssVariables.spacing[3]};
  white-space: pre-wrap;
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
    return (
      <SettingsAdminChatCollapsibleSection label={t`Reasoning`}>
        <StyledReasoningContent>{part.reasoningContent}</StyledReasoningContent>
      </SettingsAdminChatCollapsibleSection>
    );
  }

  return <SettingsAdminChatToolCallPart part={part} />;
};
