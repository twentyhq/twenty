import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const isCommandMenuOpenedStateV2 = createStateV2<boolean>({
  key: 'command-menu/isCommandMenuOpenedStateV2',
  defaultValue: false,
});
