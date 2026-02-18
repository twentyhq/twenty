import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const multiWorkspaceDropdownStateV2 = createStateV2<
  'default' | 'workspaces-list' | 'themes'
>({
  key: 'multiWorkspaceDropdownStateV2',
  defaultValue: 'default',
});
