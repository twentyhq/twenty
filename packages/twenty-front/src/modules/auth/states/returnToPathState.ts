import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const returnToPathState = createAtomState<string>({
  key: 'returnToPathState',
  defaultValue: '',
});
