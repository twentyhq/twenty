import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
export const canManageFeatureFlagsState = createAtomState<boolean>({
  key: 'canManageFeatureFlagsState',
  defaultValue: false,
});
