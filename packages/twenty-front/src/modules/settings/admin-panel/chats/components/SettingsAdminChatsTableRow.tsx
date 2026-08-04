import { t } from '@lingui/core/macro';
import { styled } from '@linaria/react';

import { isNonEmptyString } from '@sniptt/guards';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { Tag } from 'twenty-ui/data-display';
import { OverflowingTextWithTooltip } from 'twenty-ui/surfaces';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { SETTINGS_ADMIN_CHATS_TABLE_GRID } from '@/settings/admin-panel/chats/constants/SettingsAdminChatsTableGrid';
import { type AdminChatThreadListItem } from '@/settings/admin-panel/chats/types/AdminChatThreadListItem';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';

type SettingsAdminChatsTableRowProps = {
  thread: AdminChatThreadListItem;
  showOnboardingTag: boolean;
};

const StyledFlagsContainer = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  overflow: hidden;
`;

const StyledZeroReplies = styled.span`
  color: ${themeCssVariables.color.red};
`;

export const SettingsAdminChatsTableRow = ({
  thread,
  showOnboardingTag,
}: SettingsAdminChatsTableRowProps) => {
  return (
    <TableRow
      to={getSettingsPath(SettingsPath.AdminPanelWorkspaceChatThread, {
        workspaceId: thread.workspaceId,
        threadId: thread.id,
      })}
      gridAutoColumns={SETTINGS_ADMIN_CHATS_TABLE_GRID}
      isClickable
    >
      <TableCell>
        <OverflowingTextWithTooltip
          text={
            isNonEmptyString(thread.workspaceDisplayName)
              ? thread.workspaceDisplayName
              : thread.workspaceId
          }
        />
      </TableCell>
      <TableCell>
        <OverflowingTextWithTooltip
          text={isNonEmptyString(thread.userEmail) ? thread.userEmail : '-'}
        />
      </TableCell>
      <TableCell color={themeCssVariables.font.color.primary}>
        <OverflowingTextWithTooltip
          text={isNonEmptyString(thread.title) ? thread.title : t`Untitled`}
        />
      </TableCell>
      <TableCell align="right">{thread.messageCount}</TableCell>
      <TableCell align="right">
        {thread.userMessageCount === 0 ? (
          <StyledZeroReplies>{thread.userMessageCount}</StyledZeroReplies>
        ) : (
          thread.userMessageCount
        )}
      </TableCell>
      <TableCell>
        <StyledFlagsContainer>
          {thread.hasError && <Tag color="red" text={t`Error`} />}
          {isDefined(thread.deletedAt) && (
            <Tag color="gray" text={t`Archived`} />
          )}
          {showOnboardingTag && thread.isOnboardingThread && (
            <Tag color="blue" text={t`Onboarding`} />
          )}
        </StyledFlagsContainer>
      </TableCell>
      <TableCell align="right">
        {new Date(thread.createdAt).toLocaleDateString()}
      </TableCell>
    </TableRow>
  );
};
