import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';
export const isRequestingCaptchaTokenState = createStateV2<boolean>({
  key: 'isRequestingCaptchaTokenState',
  defaultValue: false,
});
