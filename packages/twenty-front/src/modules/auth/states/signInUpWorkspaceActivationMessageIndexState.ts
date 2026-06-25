import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const signInUpWorkspaceActivationMessageIndexState =
  createAtomState<number>({
    key: 'signInUpWorkspaceActivationMessageIndexState',
    defaultValue: 0,
  });
