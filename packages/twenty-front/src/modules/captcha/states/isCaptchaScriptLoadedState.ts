import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';
export const isCaptchaScriptLoadedState = createStateV2<boolean>({
  key: 'isCaptchaScriptLoadedState',
  defaultValue: false,
});
