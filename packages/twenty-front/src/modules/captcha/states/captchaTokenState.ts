import { type CaptchaToken } from '@/captcha/types/CaptchaToken';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const captchaTokenState = createAtomState<CaptchaToken | undefined>({
  key: 'captchaTokenState',
  defaultValue: undefined,
});
