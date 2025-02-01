import { createState } from "twenty-shared";

import { Sentry } from '~/generated/graphql';

export const sentryConfigState = createState<Sentry | null>({
  key: 'sentryConfigState',
  defaultValue: null,
});
