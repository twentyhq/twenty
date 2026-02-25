import { type PublicFeatureFlag } from '~/generated-metadata/graphql';

import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const labPublicFeatureFlagsStateV2 = createAtomState<
  PublicFeatureFlag[]
>({
  key: 'labPublicFeatureFlagsStateV2',
  defaultValue: [],
});
