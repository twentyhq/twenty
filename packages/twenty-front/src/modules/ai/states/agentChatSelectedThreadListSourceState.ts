import { isNonEmptyString } from '@sniptt/guards';
import { AGENT_CHAT_THREAD_PRESET_FILTER } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { AGENT_CHAT_DEFAULT_SELECTED_THREAD_LIST_SOURCE } from '@/ai/constants/AgentChatDefaultSelectedThreadListSource';
import { type AgentChatSelectedThreadListSource } from '@/ai/types/AgentChatSelectedThreadListSource';
import { findAgentChatChannelOpenViewItem } from '@/ai/utils/findAgentChatChannelOpenViewItem';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
import {
  AgentChatChannelAssignmentFilter,
  AgentChatChannelThreadFilter,
  AgentChatChannelThreadStatus,
} from '~/generated-metadata/graphql';

export const agentChatSelectedThreadListSourceState =
  createAtomState<AgentChatSelectedThreadListSource>({
    key: 'agentChatSelectedThreadListSourceState',
    defaultValue: AGENT_CHAT_DEFAULT_SELECTED_THREAD_LIST_SOURCE,
    useLocalStorage: true,
    localStorageOptions: { getOnInit: true },
    validateInitFn: (source) => {
      if (source.type === 'presetFilter') {
        return Object.values(AGENT_CHAT_THREAD_PRESET_FILTER).includes(
          source.presetFilter,
        );
      }

      const channelView = source.channelView;

      return (
        isDefined(channelView) &&
        isNonEmptyString(channelView.channelId) &&
        (isDefined(findAgentChatChannelOpenViewItem(channelView)) ||
          (Object.values(AgentChatChannelThreadStatus).includes(
            channelView.channelStatus,
          ) &&
            channelView.assignment === AgentChatChannelAssignmentFilter.ANY &&
            channelView.filter === AgentChatChannelThreadFilter.ANY))
      );
    },
  });
