import { isNonEmptyString } from '@sniptt/guards';

import { type AgentChatChannelView } from '@/ai/types/AgentChatChannelView';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
import {
  AgentChatChannelAssignmentFilter,
  AgentChatChannelThreadStatus,
} from '~/generated-metadata/graphql';

// The channel the inbox shows, instead of a triage list. Null shows triage
export const agentChatChannelViewState =
  createAtomState<AgentChatChannelView | null>({
    key: 'agentChatChannelViewState',
    defaultValue: null,
    useLocalStorage: true,
    localStorageOptions: { getOnInit: true },
    validateInitFn: (channelView) =>
      isNonEmptyString(channelView.channelId) &&
      Object.values(AgentChatChannelThreadStatus).includes(
        channelView.channelStatus,
      ) &&
      Object.values(AgentChatChannelAssignmentFilter).includes(
        channelView.assignment,
      ),
  });
