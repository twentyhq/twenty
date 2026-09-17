import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

// Roles held by the current user, loaded with the channels: which channels
// the user reads through a role is worked out on the client.
export const agentChatCurrentUserRoleIdsState = createAtomState<string[]>({
  key: 'agentChatCurrentUserRoleIdsState',
  defaultValue: [],
});
