import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const isEmailingDomainsEnabledState = createAtomState<boolean>({
  key: 'isEmailingDomainsEnabled',
  defaultValue: false,
});
