import { type Sentry } from '~/generated-metadata/graphql';
import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const sentryConfigState = createStateV2<Sentry | null>({
  key: 'sentryConfigState',
  defaultValue: null,
});
