import { type PublicFeatureFlag } from '~/generated-metadata/graphql';

import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const labPublicFeatureFlagsStateV2 = createStateV2<PublicFeatureFlag[]>({
  key: 'labPublicFeatureFlagsStateV2',
  defaultValue: [],
});
