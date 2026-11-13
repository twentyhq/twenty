import { useSettingsInboxChannels } from '@/settings/roles/role-permissions/agent-chat-channels/hooks/useSettingsInboxChannels';
import { settingsDraftRoleInboxChannelAccessFamilyState } from '@/settings/roles/states/settingsDraftRoleInboxChannelAccessFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';

export const useRoleInboxChannelIds = (roleId: string) => {
  const settingsInboxChannels = useSettingsInboxChannels();
  const settingsDraftRoleInboxChannelAccess = useAtomFamilyStateValue(
    settingsDraftRoleInboxChannelAccessFamilyState,
    roleId,
  );

  return settingsInboxChannels
    .filter(
      (channel) =>
        settingsDraftRoleInboxChannelAccess[channel.id] ??
        channel.roleIds.includes(roleId),
    )
    .map(({ id }) => id);
};
