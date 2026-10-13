import { agentChatChannelsState } from '@/ai/states/agentChatChannelsState';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';
import { type AgentChatChannel } from '~/generated-metadata/graphql';

export const agentChatAccessibleChannelsSelector = createAtomSelector<
  AgentChatChannel[]
>({
  key: 'agentChatAccessibleChannelsSelector',
  get: ({ get }) =>
    (get(agentChatChannelsState) ?? []).filter(
      ({ isAccessible }) => isAccessible,
    ),
});
