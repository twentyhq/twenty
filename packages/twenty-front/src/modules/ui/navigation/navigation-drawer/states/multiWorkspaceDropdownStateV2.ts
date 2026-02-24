import { createState } from '@/ui/utilities/state/jotai/utils/createState';

export const multiWorkspaceDropdownStateV2 = createState<
  'default' | 'workspaces-list' | 'themes'
>({
  key: 'multiWorkspaceDropdownStateV2',
  defaultValue: 'default',
});
