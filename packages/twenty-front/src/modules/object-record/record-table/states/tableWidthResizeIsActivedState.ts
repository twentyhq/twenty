import { createState } from '@/ui/utilities/state/jotai/utils/createState';

export const tableWidthResizeIsActiveState = createState<boolean>({
  key: 'tableWidthResizeIsActiveState',
  defaultValue: true,
});
