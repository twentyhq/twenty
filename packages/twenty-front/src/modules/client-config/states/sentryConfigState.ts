import { type Sentry } from '~/generated-metadata/graphql';
import { createState } from 'twenty-ui/utilities';

export const sentryConfigState = createState<Sentry | null>({
  key: 'sentryConfigState',
  defaultValue: null,
});
