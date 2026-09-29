import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const isLogConsoleFullScreenState = createAtomState<boolean>({
  key: 'isLogConsoleFullScreenState',
  defaultValue: false,
});
