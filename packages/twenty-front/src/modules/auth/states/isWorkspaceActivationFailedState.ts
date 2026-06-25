import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const isWorkspaceActivationFailedState = createAtomState<boolean>({
  key: 'isWorkspaceActivationFailedState',
  defaultValue: false,
});
