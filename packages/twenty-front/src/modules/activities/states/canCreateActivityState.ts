import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
export const canCreateActivityState = createAtomState<boolean>({
  key: 'canCreateActivityState',
  defaultValue: false,
});
