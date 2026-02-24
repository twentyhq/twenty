import { createState } from '@/ui/utilities/state/jotai/utils/createState';

export const isCommandMenuOpenedStateV2 = createState<boolean>({
  key: 'command-menu/isCommandMenuOpenedStateV2',
  defaultValue: false,
});
