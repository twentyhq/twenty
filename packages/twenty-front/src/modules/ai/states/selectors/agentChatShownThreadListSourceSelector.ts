import { isDefined } from 'twenty-shared/utils';

import { agentChatThreadFilterStatusState } from '@/ai/states/agentChatThreadFilterStatusState';
import { agentChatShownChannelViewSelector } from '@/ai/states/selectors/agentChatShownChannelViewSelector';
import { type AgentChatThreadListSource } from '@/ai/types/AgentChatThreadListSource';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const agentChatShownThreadListSourceSelector =
  createAtomSelector<AgentChatThreadListSource>({
    key: 'agentChatShownThreadListSourceSelector',
    get: ({ get }) => {
      const channelView = get(agentChatShownChannelViewSelector);

      return isDefined(channelView)
        ? { type: 'channel', channelView }
        : {
            type: 'presetFilter',
            filterStatus: get(agentChatThreadFilterStatusState),
          };
    },
    areEqual: isDeeplyEqual,
  });
