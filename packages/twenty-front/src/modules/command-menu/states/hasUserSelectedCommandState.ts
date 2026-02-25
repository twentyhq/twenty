import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
export const hasUserSelectedCommandState = createAtomState({
  key: 'hasUserSelectedCommandState',
  defaultValue: false,
});
