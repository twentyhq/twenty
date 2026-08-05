import { t } from '@lingui/core/macro';
import { styled } from '@linaria/react';

import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { SettingsAdminChatsTable } from '@/settings/admin-panel/chats/components/SettingsAdminChatsTable';
import { type AdminChatThreadListItem } from '@/settings/admin-panel/chats/types/AdminChatThreadListItem';
import { SettingsEmptyPlaceholder } from '@/settings/components/SettingsEmptyPlaceholder';

type SettingsAdminChatsContentProps = {
  threads: AdminChatThreadListItem[];
  loading: boolean;
  error?: Error;
};

const StyledTableContainer = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  margin-top: ${themeCssVariables.spacing[3]};
`;

export const SettingsAdminChatsContent = ({
  threads,
  loading,
  error,
}: SettingsAdminChatsContentProps) => {
  if (isDefined(error)) {
    return (
      <SettingsEmptyPlaceholder>{t`Failed to load chats. Please try again.`}</SettingsEmptyPlaceholder>
    );
  }

  if (loading && threads.length === 0) {
    return (
      <SettingsEmptyPlaceholder>{t`Loading chats...`}</SettingsEmptyPlaceholder>
    );
  }

  if (threads.length === 0) {
    return (
      <SettingsEmptyPlaceholder>{t`No chats found`}</SettingsEmptyPlaceholder>
    );
  }

  return (
    <StyledTableContainer>
      <SettingsAdminChatsTable threads={threads} />
    </StyledTableContainer>
  );
};
