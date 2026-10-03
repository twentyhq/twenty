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
import { type AdminChatTurnContext } from '@/settings/admin-panel/types/AdminChatTurnContext';
import { isRenderableAdminChatMessagePart } from '@/settings/admin-panel/utils/isRenderableAdminChatMessagePart';

type SettingsAdminChatThreadMessageListProps = {
  messages: AdminChatThreadMessage[];
  contexts: AdminChatTurnContext[];
};

type SettingsAdminChatThreadItem =
  | { kind: 'context'; context: string; createdAt: string }
  | { kind: 'message'; message: AdminChatThreadMessage; createdAt: string };

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

  // a context stands where its turn opened, as the model reads it
  const items: SettingsAdminChatThreadItem[] = [
    ...contexts.map(({ context, createdAt }) => ({
      kind: 'context' as const,
      context,
      createdAt,
    })),
    ...visibleMessages.map((message) => ({
      kind: 'message' as const,
      message,
      createdAt: message.createdAt,
    })),
  ].sort(
    (first, second) =>
      new Date(first.createdAt).getTime() -
      new Date(second.createdAt).getTime(),
  );

  if (!isNonEmptyArray(items)) {
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
        {items.map((item, index) =>
          item.kind === 'message' ? (
            <SettingsAdminChatMessage
              key={item.message.id}
              message={item.message}
            />
          ) : (
            <SettingsAdminChatCollapsibleSection key={index} label={t`Context`}>
              <StyledContext>{item.context}</StyledContext>
            </SettingsAdminChatCollapsibleSection>
          ),
        )}
      </StyledMessagesContainer>
    </ChatReferenceNavigationEnabledContext.Provider>
  );
};
