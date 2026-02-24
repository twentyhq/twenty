import { createState } from '@/ui/utilities/state/jotai/utils/createState';
export const isCaptchaScriptLoadedState = createState<boolean>({
  key: 'isCaptchaScriptLoadedState',
  defaultValue: false,
});
