import { t } from '@lingui/core/macro';
import { styled } from '@linaria/react';

import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { Card } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables } from 'twenty-ui/theme';
import { AgentMessageRole } from '~/generated-admin/graphql';

import { ChatReferenceNavigationEnabledContext } from '@/ai/contexts/ChatReferenceNavigationEnabledContext';
import { SettingsAdminChatCollapsibleSection } from '@/settings/admin-panel/components/SettingsAdminChatCollapsibleSection';
import { SettingsAdminChatMessage } from '@/settings/admin-panel/components/SettingsAdminChatMessage';
import { type AdminChatThreadMessage } from '@/settings/admin-panel/types/AdminChatThreadMessage';
import { isRenderableAdminChatMessagePart } from '@/settings/admin-panel/utils/isRenderableAdminChatMessagePart';

type SettingsAdminChatThreadMessageListProps = {
  messages: AdminChatThreadMessage[];
  contexts: string[];
};

const StyledMessagesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
`;

const StyledContext = styled.div`
  background: ${themeCssVariables.background.transparent.lighter};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  padding: ${themeCssVariables.spacing[3]};
  white-space: pre-wrap;
`;

export const SettingsAdminChatThreadMessageList = ({
  messages,
  contexts,
}: SettingsAdminChatThreadMessageListProps) => {
  const visibleMessages = messages.filter(
    (message) =>
      message.role !== AgentMessageRole.SYSTEM &&
      message.parts.some(isRenderableAdminChatMessagePart),
  );

  if (!isNonEmptyArray(visibleMessages) && !isNonEmptyArray(contexts)) {
    return (
      <Card.Root rounded>
        <TableRow gridTemplateColumns="1fr">
          <TableCell
            color={themeCssVariables.font.color.tertiary}
            align="center"
          >
            {t`No messages found.`}
          </TableCell>
        </TableRow>
      </Card.Root>
    );
  }

  return (
    <ChatReferenceNavigationEnabledContext.Provider value={false}>
      <StyledMessagesContainer>
        {contexts.map((context, index) => (
          <SettingsAdminChatCollapsibleSection key={index} label={t`Context`}>
            <StyledContext>{context}</StyledContext>
          </SettingsAdminChatCollapsibleSection>
        ))}
        {visibleMessages.map((message) => (
          <SettingsAdminChatMessage key={message.id} message={message} />
        ))}
      </StyledMessagesContainer>
    </ChatReferenceNavigationEnabledContext.Provider>
  );
};
