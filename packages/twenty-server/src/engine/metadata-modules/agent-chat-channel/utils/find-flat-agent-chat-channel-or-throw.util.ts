import { isDefined } from 'twenty-shared/utils';

import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { type FlatAgentChatChannel } from 'src/engine/metadata-modules/flat-agent-chat-channel/types/flat-agent-chat-channel.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';

export const findFlatAgentChatChannelOrThrow = ({
  flatAgentChatChannelMaps,
  channelId,
}: {
  flatAgentChatChannelMaps: FlatEntityMaps<FlatAgentChatChannel>;
  channelId: string;
}): FlatAgentChatChannel => {
  const channel = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: channelId,
    flatEntityMaps: flatAgentChatChannelMaps,
  });

  if (!isDefined(channel)) {
    throw new AiException(
      'Channel not found',
      AiExceptionCode.CHAT_CHANNEL_NOT_FOUND,
    );
  }

  return channel;
};
