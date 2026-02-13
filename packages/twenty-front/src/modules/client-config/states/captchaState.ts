import { type Captcha } from '~/generated-metadata/graphql';
import { createState } from '@/ui/utilities/state/utils/createState';

export const captchaState = createState<Captcha | null>({
  key: 'captchaState',
  defaultValue: null,
});
