import { type Captcha } from '~/generated-metadata/graphql';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const captchaState = createAtomState<Captcha | null>({
  key: 'captchaState',
  defaultValue: null,
});
