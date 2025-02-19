import { createState } from '@ui/utilities/state/utils/createState';

import { Sentry } from '~/generated/graphql';

export const sentryConfigState = createState<Sentry | null>({
  key: 'sentryConfigState',
  defaultValue: null,
});
