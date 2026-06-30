import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const isEmailingDomainInDemoModeState = createAtomState<boolean>({
  key: 'isEmailingDomainInDemoMode',
  defaultValue: false,
});
