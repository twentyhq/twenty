import { t } from '@lingui/core/macro';
import { styled } from '@linaria/react';

import { themeCssVariables } from 'twenty-ui/theme-constants';

import { SettingsAdminChatCollapsibleSection } from '@/settings/admin-panel/components/SettingsAdminChatCollapsibleSection';
import { SettingsAdminChatMessagePartRenderer } from '@/settings/admin-panel/components/SettingsAdminChatMessagePartRenderer';
import { type AdminChatThreadMessage } from '@/settings/admin-panel/types/AdminChatThreadMessage';
import { isRenderableAdminChatMessagePart } from '@/settings/admin-panel/utils/isRenderableAdminChatMessagePart';
import { AgentMessageRole } from '~/generated-admin/graphql';

type SettingsAdminChatMessageProps = {
  message: AdminChatThreadMessage;
};

const StyledMessageBubble = styled.div<{ isUser?: boolean }>`
  align-items: ${({ isUser }) => (isUser ? 'flex-end' : 'flex-start')};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  width: 100%;
`;

const StyledRoleLabel = styled.span`
  color: ${themeCssVariables.font.color.light};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.medium};
  text-transform: capitalize;
`;

const StyledTimestamp = styled.span`
  color: ${themeCssVariables.font.color.light};
  font-size: ${themeCssVariables.font.size.xs};
`;

export const SettingsAdminChatMessage = ({
  message,
}: SettingsAdminChatMessageProps) => {
  const isUser = message.role === AgentMessageRole.USER;

  const renderableParts = message.parts
    .filter(isRenderableAdminChatMessagePart)
    .sort((a, b) => a.orderIndex - b.orderIndex);

  const messageBody = (
    <StyledMessageBubble isUser={isUser && !message.isHidden}>
      {!message.isHidden && <StyledRoleLabel>{message.role}</StyledRoleLabel>}
      {renderableParts.map((part) => (
        <SettingsAdminChatMessagePartRenderer
          key={part.orderIndex}
          part={part}
          isUserMessage={isUser}
        />
      ))}
      <StyledTimestamp>
        {new Date(message.createdAt).toLocaleString()}
      </StyledTimestamp>
    </StyledMessageBubble>
  );

  if (message.isHidden) {
    return (
      <SettingsAdminChatCollapsibleSection label={t`Kickoff prompt`}>
        {messageBody}
      </SettingsAdminChatCollapsibleSection>
    );
  }

  return messageBody;
};
