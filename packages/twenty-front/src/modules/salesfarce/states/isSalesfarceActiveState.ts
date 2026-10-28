import { consumeIsSalesfarceRequested } from '@/salesfarce/utils/consumeIsSalesfarceRequested';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const isSalesfarceActiveState = createAtomState<boolean>({
  key: 'isSalesfarceActiveState',
  defaultValue: consumeIsSalesfarceRequested(),
});
