import { atom } from 'recoil';

import { Sentry } from '~/generated/graphql';

export const sentryConfigState = atom<Sentry | null>({
  key: 'sentryConfigState',
  default: null,
});
