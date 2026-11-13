import { isDefined } from 'twenty-shared/utils';

import { useSettingsInboxChannels } from '@/settings/roles/role-permissions/agent-chat-channels/hooks/useSettingsAgentChatChannels';
import { settingsDraftRoleInboxChannelAccessFamilyState } from '@/settings/roles/states/settingsDraftRoleAgentChatChannelAccessFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';

export const useRoleInboxChannelsWithChangedAccess = (roleId: string) => {
  const settingsInboxChannels = useSettingsInboxChannels();
  const settingsDraftRoleInboxChannelAccess = useAtomFamilyStateValue(
    settingsDraftRoleInboxChannelAccessFamilyState,
    roleId,
  );

  return settingsInboxChannels.filter((channel) => {
    const hasDraftAccess = settingsDraftRoleInboxChannelAccess[channel.id];

    return (
      isDefined(hasDraftAccess) &&
      hasDraftAccess !== channel.roleIds.includes(roleId)
    );
  });
};
