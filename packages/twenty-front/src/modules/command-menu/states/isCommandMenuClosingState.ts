import { createState } from '@/ui/utilities/state/jotai/utils/createState';
export const isCommandMenuClosingState = createState({
  key: 'command-menu/isCommandMenuClosingState',
  defaultValue: false,
});
