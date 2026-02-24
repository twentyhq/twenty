import { createState } from '@/ui/utilities/state/jotai/utils/createState';

export const workspaceBypassModeState = createState<boolean>({
  key: 'workspaceBypassModeState',
  defaultValue: false,
});
