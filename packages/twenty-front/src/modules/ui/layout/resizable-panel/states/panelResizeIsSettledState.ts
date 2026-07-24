import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const panelResizeIsSettledState = createAtomState<boolean>({
  key: 'panelResizeIsSettledState',
  defaultValue: true,
});
