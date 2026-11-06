import { isDefined } from 'twenty-shared/utils';

import { type FlatAgentChatChannel } from 'src/engine/metadata-modules/flat-agent-chat-channel/types/flat-agent-chat-channel.type';

export const getAvailableAgentChatChannelName = ({
  name,
  flatAgentChatChannelMaps,
}: {
  name: string;
  flatAgentChatChannelMaps: {
    byUniversalIdentifier: Partial<
      Record<string, Pick<FlatAgentChatChannel, 'name'>>
    >;
  };
}): string => {
  const takenNames = Object.values(
    flatAgentChatChannelMaps.byUniversalIdentifier,
  )
    .filter(isDefined)
    .map((channel) => channel.name);
  let availableName = name;

  for (let suffix = 2; takenNames.includes(availableName); suffix++) {
    availableName = `${name} ${suffix}`;
  }

  return availableName;
};
