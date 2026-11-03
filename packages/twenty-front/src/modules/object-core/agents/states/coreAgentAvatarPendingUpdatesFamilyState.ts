import { type CoreAgentAvatarPendingUpdate } from '@/object-core/agents/types/CoreAgentAvatarPendingUpdate';
import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const coreAgentAvatarPendingUpdatesFamilyState = createAtomFamilyState<
  CoreAgentAvatarPendingUpdate[],
  string
>({
  key: 'coreAgentAvatarPendingUpdatesFamilyState',
  defaultValue: [],
});
