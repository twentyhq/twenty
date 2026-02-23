import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';
export const captchaTokenState = createStateV2<string | undefined>({
  key: 'captchaTokenState',
  defaultValue: undefined,
});
