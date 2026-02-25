import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
export const isRequestingCaptchaTokenState = createAtomState<boolean>({
  key: 'isRequestingCaptchaTokenState',
  defaultValue: false,
});
