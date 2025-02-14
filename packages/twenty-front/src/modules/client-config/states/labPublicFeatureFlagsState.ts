import { atom } from 'recoil';
import { PublicFeatureFlag } from '~/generated/graphql';

export const labPublicFeatureFlagsState = atom<PublicFeatureFlag[]>({
  key: 'labPublicFeatureFlagsState',
  default: [],
});
