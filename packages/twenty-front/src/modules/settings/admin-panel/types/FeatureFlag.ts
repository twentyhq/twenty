import { FeatureFlagKey } from '~/generated/graphql';

export type FeatureFlag = {
  key: FeatureFlagKey;
  value: boolean;
};
