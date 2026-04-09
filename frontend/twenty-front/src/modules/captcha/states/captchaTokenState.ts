import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
export const captchaTokenState = createAtomState<string | undefined>({
  key: 'captchaTokenState',
  defaultValue: undefined,
});
