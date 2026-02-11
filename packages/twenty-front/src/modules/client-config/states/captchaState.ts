import { type Captcha } from '~/generated-metadata/graphql';
import { createState } from 'twenty-ui/utilities';

export const captchaState = createState<Captcha | null>({
  key: 'captchaState',
  defaultValue: null,
});
