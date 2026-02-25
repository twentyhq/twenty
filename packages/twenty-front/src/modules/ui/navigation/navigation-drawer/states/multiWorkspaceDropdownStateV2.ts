import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const multiWorkspaceDropdownStateV2 = createAtomState<
  'default' | 'workspaces-list' | 'themes'
>({
  key: 'multiWorkspaceDropdownStateV2',
  defaultValue: 'default',
});
