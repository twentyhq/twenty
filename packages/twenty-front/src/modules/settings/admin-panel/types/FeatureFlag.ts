import { type FeatureFlagKey } from '~/generated-metadata/graphql';

export type FeatureFlag = {
  key: FeatureFlagKey;
  value: boolean;
};
