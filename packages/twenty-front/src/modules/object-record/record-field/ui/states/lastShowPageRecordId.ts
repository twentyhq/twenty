import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const lastShowPageRecordIdState = createAtomState<string | null>({
  key: 'lastShowPageRecordIdState',
  defaultValue: null,
});
