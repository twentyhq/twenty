import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const isCookieSessionEnabledState = createAtomState<boolean>({
  key: 'isCookieSessionEnabled',
  defaultValue: false,
});
