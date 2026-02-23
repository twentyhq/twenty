import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const workspaceBypassModeState = createStateV2<boolean>({
  key: 'workspaceBypassModeState',
  defaultValue: false,
});
