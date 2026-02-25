import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
export const isAppEffectRedirectEnabledState = createAtomState<boolean>({
  key: 'isAppEffectRedirectEnabledState',
  defaultValue: true,
});
