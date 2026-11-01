import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { type AgentChatChannelView } from '@/ai/types/AgentChatChannelView';
import { findAgentChatChannelOpenViewItem } from '@/ai/utils/findAgentChatChannelOpenViewItem';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
import {
  AgentChatChannelAssignmentFilter,
  AgentChatChannelThreadFilter,
  AgentChatChannelThreadStatus,
} from '~/generated-metadata/graphql';

export const agentChatChannelViewState =
  createAtomState<AgentChatChannelView | null>({
    key: 'agentChatChannelViewState',
    defaultValue: null,
    useLocalStorage: true,
    localStorageOptions: { getOnInit: true },
    validateInitFn: (channelView) =>
      isNonEmptyString(channelView.channelId) &&
      (isDefined(findAgentChatChannelOpenViewItem(channelView)) ||
        (Object.values(AgentChatChannelThreadStatus).includes(
          channelView.channelStatus,
        ) &&
          channelView.assignment === AgentChatChannelAssignmentFilter.ANY &&
          channelView.filter === AgentChatChannelThreadFilter.ANY)),
  });
