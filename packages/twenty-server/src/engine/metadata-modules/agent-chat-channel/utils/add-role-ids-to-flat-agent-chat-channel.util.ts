import { isDefined } from 'twenty-shared/utils';

import { type FlatAgentChatChannelWithRoleIds } from 'src/engine/metadata-modules/agent-chat-channel/types/flat-agent-chat-channel-with-role-ids.type';
import { type FlatAgentChatChannelRole } from 'src/engine/metadata-modules/flat-agent-chat-channel-role/types/flat-agent-chat-channel-role.type';
import { type FlatAgentChatChannel } from 'src/engine/metadata-modules/flat-agent-chat-channel/types/flat-agent-chat-channel.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';

export const addRoleIdsToFlatAgentChatChannel = ({
  channel,
  flatAgentChatChannelRoleMaps,
}: {
  channel: FlatAgentChatChannel;
  flatAgentChatChannelRoleMaps: FlatEntityMaps<FlatAgentChatChannelRole>;
}): FlatAgentChatChannelWithRoleIds => ({
  ...channel,
  roleIds: channel.channelRoleIds
    .map(
      (channelRoleId) =>
        findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: channelRoleId,
          flatEntityMaps: flatAgentChatChannelRoleMaps,
        })?.roleId,
    )
    .filter(isDefined),
});
