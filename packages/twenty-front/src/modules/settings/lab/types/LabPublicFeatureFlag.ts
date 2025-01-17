import { FeatureFlagKey, FeatureFlagMetadata } from '~/generated/graphql';

export type LabPublicFeatureFlag = {
  id: string;
  key: FeatureFlagKey;
  value: boolean;
  workspaceId: string;
  metadata: FeatureFlagMetadata;
};
