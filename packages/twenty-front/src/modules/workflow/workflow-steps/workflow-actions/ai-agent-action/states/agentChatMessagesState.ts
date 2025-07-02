import { atom } from 'recoil';

import { AgentChatMessage } from '~/generated-metadata/graphql';

export const agentChatMessagesState = atom<AgentChatMessage[]>({
  default: [],
  key: 'agentChatMessagesState',
});
