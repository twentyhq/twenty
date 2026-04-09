import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const tableWidthResizeIsActiveState = createAtomState<boolean>({
  key: 'tableWidthResizeIsActiveState',
  defaultValue: true,
});
