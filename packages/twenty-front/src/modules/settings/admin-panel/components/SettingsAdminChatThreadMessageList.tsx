import { t } from '@lingui/core/macro';
import { styled } from '@linaria/react';

import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { Card } from 'twenty-ui/surfaces';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { AgentMessageRole } from '~/generated-admin/graphql';

import { SettingsAdminChatMessage } from '@/settings/admin-panel/components/SettingsAdminChatMessage';
import { type AdminChatThreadMessage } from '@/settings/admin-panel/types/AdminChatThreadMessage';
import { isRenderableAdminChatMessagePart } from '@/settings/admin-panel/utils/isRenderableAdminChatMessagePart';

type SettingsAdminChatThreadMessageListProps = {
  messages: AdminChatThreadMessage[];
};

const StyledMessagesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
`;

export const SettingsAdminChatThreadMessageList = ({
  messages,
}: SettingsAdminChatThreadMessageListProps) => {
  const visibleMessages = messages.filter(
    (message) =>
      message.role !== AgentMessageRole.SYSTEM &&
      message.parts.some(isRenderableAdminChatMessagePart),
  );

  if (visibleMessages.length === 0) {
    return (
      <Card rounded>
        <TableRow gridTemplateColumns="1fr">
          <TableCell
            color={themeCssVariables.font.color.tertiary}
            align="center"
          >
            {t`No messages found.`}
          </TableCell>
        </TableRow>
      </Card>
    );
  }

  return (
    <StyledMessagesContainer>
      {visibleMessages.map((message) => (
        <SettingsAdminChatMessage key={message.id} message={message} />
      ))}
    </StyledMessagesContainer>
  );
};
