import { type Captcha } from '~/generated-metadata/graphql';
import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const captchaState = createStateV2<Captcha | null>({
  key: 'captchaState',
  defaultValue: null,
});
