import { createState } from '@/ui/utilities/state/jotai/utils/createState';
export const captchaTokenState = createState<string | undefined>({
  key: 'captchaTokenState',
  defaultValue: undefined,
});
