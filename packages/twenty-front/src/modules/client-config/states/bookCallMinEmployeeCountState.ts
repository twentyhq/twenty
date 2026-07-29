import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const bookCallMinEmployeeCountState = createAtomState<number | null>({
  key: 'bookCallMinEmployeeCountState',
  defaultValue: null,
});
