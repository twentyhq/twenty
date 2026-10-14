import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const isLogConsoleCliGuideOpenState = createAtomState<boolean>({
  key: 'isLogConsoleCliGuideOpenState',
  defaultValue: true,
});
