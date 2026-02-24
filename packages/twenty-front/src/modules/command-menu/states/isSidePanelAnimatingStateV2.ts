import { createState } from '@/ui/utilities/state/jotai/utils/createState';

export const isSidePanelAnimatingStateV2 = createState<boolean>({
  key: 'command-menu/isSidePanelAnimatingStateV2',
  defaultValue: false,
});
