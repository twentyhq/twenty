import { atom } from 'recoil';

import { Sentry } from '~/generated/graphql';

export const sentryState = atom<Sentry | null>({
  key: 'sentryState',
  default: null,
});
