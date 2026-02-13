import { createState } from '@/ui/utilities/state/utils/createState';

export const workspaceBypassModeState = createState<boolean>({
  key: 'workspaceBypassModeState',
  defaultValue: false,
});
