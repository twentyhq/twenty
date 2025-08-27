import { atom } from 'recoil';
import { type PublicFeatureFlag } from '~/generated/graphql';

export const labPublicFeatureFlagsState = atom<PublicFeatureFlag[]>({
  key: 'labPublicFeatureFlagsState',
  default: [],
});
