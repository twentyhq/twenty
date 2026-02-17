import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const isSidePanelAnimatingStateV2 = createStateV2<boolean>({
  key: 'command-menu/isSidePanelAnimatingStateV2',
  defaultValue: false,
});
