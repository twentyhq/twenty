import { atom } from 'recoil';
import { FeatureFlag } from '~/generated/graphql';

export const labsFeatureFlagsState = atom<FeatureFlag[]>({
  key: 'labsFeatureFlagsState',
  default: [],
});
