import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const isEmailForwardingEnabledState = createAtomState<boolean>({
  key: 'isEmailForwardingEnabled',
  defaultValue: false,
});
