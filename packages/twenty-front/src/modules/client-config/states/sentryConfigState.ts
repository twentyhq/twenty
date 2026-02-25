import { type Sentry } from '~/generated-metadata/graphql';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const sentryConfigState = createAtomState<Sentry | null>({
  key: 'sentryConfigState',
  defaultValue: null,
});
