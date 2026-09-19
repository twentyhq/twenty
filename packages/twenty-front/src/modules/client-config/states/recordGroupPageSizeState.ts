import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const recordGroupPageSizeState = createAtomState<number | null>({
  key: 'recordGroupPageSizeState',
  defaultValue: null,
});
