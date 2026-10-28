import { isDefined } from 'twenty-shared/utils';

import { AiException } from 'src/engine/metadata-modules/ai/ai.exception';
import { type FlatAgentChatChannel } from 'src/engine/metadata-modules/flat-agent-chat-channel/types/flat-agent-chat-channel.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { validateAgentChatChannelNameUniqueness } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/validate-agent-chat-channel-name-uniqueness.util';

export const assertAgentChatChannelNameNotTakenOrThrow = ({
  name,
  universalIdentifier,
  flatAgentChatChannelMaps,
}: {
  name: string;
  universalIdentifier: string;
  flatAgentChatChannelMaps: FlatEntityMaps<FlatAgentChatChannel>;
}): void => {
  const [nameTakenError] = validateAgentChatChannelNameUniqueness({
    name,
    existingFlatAgentChatChannels: Object.values(
      flatAgentChatChannelMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter((channel) => channel.universalIdentifier !== universalIdentifier),
  });

  if (isDefined(nameTakenError)) {
    throw new AiException(nameTakenError.message, nameTakenError.code, {
      userFriendlyMessage: nameTakenError.userFriendlyMessage,
    });
  }
};
