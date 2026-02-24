import { createState } from '@/ui/utilities/state/jotai/utils/createState';
export const isRequestingCaptchaTokenState = createState<boolean>({
  key: 'isRequestingCaptchaTokenState',
  defaultValue: false,
});
