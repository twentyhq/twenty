import { createState } from 'twenty-ui/utilities';

export const workspaceBypassModeState = createState<boolean>({
  key: 'workspaceBypassModeState',
  defaultValue: false,
});
