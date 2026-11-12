import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const agentChatOnlineWorkspaceMemberIdsState = createAtomState<
  string[] | null
>({
  key: 'ai/agentChatOnlineWorkspaceMemberIdsState',
  defaultValue: null,
});
