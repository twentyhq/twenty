import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';

export const isImpersonatingState = createAtomSelector<boolean>({
  key: 'isImpersonatingState',
  get: ({ get }) => get(currentUserWorkspaceState)?.isImpersonating === true,
});
