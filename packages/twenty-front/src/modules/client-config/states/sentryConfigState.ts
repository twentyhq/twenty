import { type Sentry } from '~/generated-metadata/graphql';
import { createState } from '@/ui/utilities/state/jotai/utils/createState';

export const sentryConfigState = createState<Sentry | null>({
  key: 'sentryConfigState',
  defaultValue: null,
});
