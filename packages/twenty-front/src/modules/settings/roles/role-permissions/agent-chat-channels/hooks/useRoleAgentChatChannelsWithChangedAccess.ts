import { isDefined } from 'twenty-shared/utils';

import { useSettingsAgentChatChannels } from '@/settings/roles/role-permissions/agent-chat-channels/hooks/useSettingsAgentChatChannels';
import { settingsDraftRoleAgentChatChannelAccessFamilyState } from '@/settings/roles/states/settingsDraftRoleAgentChatChannelAccessFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';

export const useRoleAgentChatChannelsWithChangedAccess = (roleId: string) => {
  const settingsAgentChatChannels = useSettingsAgentChatChannels();
  const settingsDraftRoleAgentChatChannelAccess = useAtomFamilyStateValue(
    settingsDraftRoleAgentChatChannelAccessFamilyState,
    roleId,
  );

  return settingsAgentChatChannels.filter((channel) => {
    const hasDraftAccess = settingsDraftRoleAgentChatChannelAccess[channel.id];

    return (
      isDefined(hasDraftAccess) &&
      hasDraftAccess !== channel.roleIds.includes(roleId)
    );
  });
};
