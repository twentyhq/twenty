import { useSettingsAgentChatChannels } from '@/settings/roles/role-permissions/agent-chat-channels/hooks/useSettingsAgentChatChannels';
import { settingsDraftRoleAgentChatChannelIdsFamilyState } from '@/settings/roles/states/settingsDraftRoleAgentChatChannelIdsFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';

export const useRoleAgentChatChannelIds = (roleId: string) => {
  const settingsAgentChatChannels = useSettingsAgentChatChannels();
  const settingsDraftRoleAgentChatChannelIds = useAtomFamilyStateValue(
    settingsDraftRoleAgentChatChannelIdsFamilyState,
    roleId,
  );

  return (
    settingsDraftRoleAgentChatChannelIds ??
    settingsAgentChatChannels
      .filter((channel) => channel.roleIds.includes(roleId))
      .map(({ id }) => id)
  );
};
