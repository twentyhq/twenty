import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
export const isUpsertingActivityInDBState = createAtomState<boolean>({
  key: 'isUpsertingActivityInDBState',
  defaultValue: false,
});
