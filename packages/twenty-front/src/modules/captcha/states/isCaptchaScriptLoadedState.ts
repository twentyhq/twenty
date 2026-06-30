import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
export const isCaptchaScriptLoadedState = createAtomState<boolean>({
  key: 'isCaptchaScriptLoadedState',
  defaultValue: false,
});
