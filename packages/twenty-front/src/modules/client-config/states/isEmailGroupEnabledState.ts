import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const isEmailGroupEnabledState = createAtomState<boolean>({
  key: 'isEmailGroupEnabled',
  defaultValue: false,
});
