import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const aiChatOnlineWorkspaceMemberIdsState = createAtomState<
  string[] | null
>({
  key: 'ai/aiChatOnlineWorkspaceMemberIdsState',
  defaultValue: null,
});
