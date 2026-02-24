import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const tableWidthResizeIsActiveState = createStateV2<boolean>({
  key: 'tableWidthResizeIsActiveState',
  defaultValue: true,
});
