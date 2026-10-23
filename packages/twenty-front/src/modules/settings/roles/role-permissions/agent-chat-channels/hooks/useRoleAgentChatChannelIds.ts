import { useSettingsAgentChatChannels } from '@/settings/roles/role-permissions/agent-chat-channels/hooks/useSettingsAgentChatChannels';
import { settingsDraftRoleAgentChatChannelAccessFamilyState } from '@/settings/roles/states/settingsDraftRoleAgentChatChannelAccessFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';

export const useRoleAgentChatChannelIds = (roleId: string) => {
  const settingsAgentChatChannels = useSettingsAgentChatChannels();
  const settingsDraftRoleAgentChatChannelAccess = useAtomFamilyStateValue(
    settingsDraftRoleAgentChatChannelAccessFamilyState,
    roleId,
  );

  return settingsAgentChatChannels
    .filter(
      (channel) =>
        settingsDraftRoleAgentChatChannelAccess[channel.id] ??
        channel.roleIds.includes(roleId),
    )
    .map(({ id }) => id);
};
