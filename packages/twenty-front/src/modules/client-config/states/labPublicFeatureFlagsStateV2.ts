import { type PublicFeatureFlag } from '~/generated-metadata/graphql';

import { createState } from '@/ui/utilities/state/jotai/utils/createState';

export const labPublicFeatureFlagsStateV2 = createState<PublicFeatureFlag[]>({
  key: 'labPublicFeatureFlagsStateV2',
  defaultValue: [],
});
