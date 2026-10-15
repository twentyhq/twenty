import { useQuery } from '@apollo/client/react';
import { isDefined } from 'twenty-shared/utils';

import { useAgentChatChannelActions } from '@/ai/hooks/useAgentChatChannelActions';
import { settingsDraftRoleAgentChatChannelIdsFamilyState } from '@/settings/roles/states/settingsDraftRoleAgentChatChannelIdsFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import {
  FeatureFlagKey,
  GetAgentChatChannelsDocument,
} from '~/generated-metadata/graphql';

export const useRoleAgentChatChannelAccess = (roleId: string) => {
  const isAiChatInboxEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
  );
  const { data, loading } = useQuery(GetAgentChatChannelsDocument, {
    fetchPolicy: 'cache-and-network',
    skip: !isAiChatInboxEnabled,
  });
  const settingsDraftRoleAgentChatChannelIds = useAtomFamilyStateValue(
    settingsDraftRoleAgentChatChannelIdsFamilyState,
    roleId,
  );
  const setSettingsDraftRoleAgentChatChannelIds = useSetAtomFamilyState(
    settingsDraftRoleAgentChatChannelIdsFamilyState,
    roleId,
  );
  const { updateAgentChatChannel } = useAgentChatChannelActions();

  const channels = data?.agentChatChannels ?? [];
  const checkedChannelIds =
    settingsDraftRoleAgentChatChannelIds ??
    channels
      .filter((channel) => channel.roleIds.includes(roleId))
      .map(({ id }) => id);
  const changedChannels = isDefined(settingsDraftRoleAgentChatChannelIds)
    ? channels.filter(
        (channel) =>
          settingsDraftRoleAgentChatChannelIds.includes(channel.id) !==
          channel.roleIds.includes(roleId),
      )
    : [];

  const toggleChannel = (channelId: string) =>
    setSettingsDraftRoleAgentChatChannelIds(
      checkedChannelIds.includes(channelId)
        ? checkedChannelIds.filter(
            (checkedChannelId) => checkedChannelId !== channelId,
          )
        : [...checkedChannelIds, channelId],
    );

  const saveChannelAccess = async () => {
    for (const channel of changedChannels) {
      await updateAgentChatChannel({
        channelId: channel.id,
        input: {
          roleIds: channel.roleIds.includes(roleId)
            ? channel.roleIds.filter(
                (channelRoleId) => channelRoleId !== roleId,
              )
            : [...channel.roleIds, roleId],
        },
      });
    }

    setSettingsDraftRoleAgentChatChannelIds(null);
  };

  return {
    channels,
    isLoading: loading && channels.length === 0,
    checkedChannelIds,
    isChannelAccessDirty: changedChannels.length > 0,
    toggleChannel,
    saveChannelAccess,
    resetChannelAccess: () => setSettingsDraftRoleAgentChatChannelIds(null),
  };
};
