import { isDefined } from 'twenty-shared/utils';

import { useSettingsAgentChatChannels } from '@/settings/roles/role-permissions/agent-chat-channels/hooks/useSettingsAgentChatChannels';
import { settingsDraftRoleAgentChatChannelIdsFamilyState } from '@/settings/roles/states/settingsDraftRoleAgentChatChannelIdsFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';

export const useRoleAgentChatChannelsWithChangedAccess = (roleId: string) => {
  const settingsAgentChatChannels = useSettingsAgentChatChannels();
  const settingsDraftRoleAgentChatChannelIds = useAtomFamilyStateValue(
    settingsDraftRoleAgentChatChannelIdsFamilyState,
    roleId,
  );

  if (!isDefined(settingsDraftRoleAgentChatChannelIds)) {
    return [];
  }

  return settingsAgentChatChannels.filter(
    (channel) =>
      settingsDraftRoleAgentChatChannelIds.includes(channel.id) !==
      channel.roleIds.includes(roleId),
  );
};
