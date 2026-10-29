import { salesfarceConsumeRequest } from '@/salesfarce/utils/salesfarceConsumeRequest';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const salesfarceIsActiveState = createAtomState<boolean>({
  key: 'salesfarceIsActiveState',
  defaultValue: salesfarceConsumeRequest(),
});
