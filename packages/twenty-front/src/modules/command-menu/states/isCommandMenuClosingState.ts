import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';
export const isCommandMenuClosingState = createStateV2({
  key: 'command-menu/isCommandMenuClosingState',
  defaultValue: false,
});
