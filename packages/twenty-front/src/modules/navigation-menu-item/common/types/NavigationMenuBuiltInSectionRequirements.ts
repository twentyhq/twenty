import {
  type FeatureFlagKey,
  type PermissionFlagType,
} from '~/generated-metadata/graphql';

export type NavigationMenuBuiltInSectionRequirements = {
  key: string;
  requiredPermissionFlag?: PermissionFlagType;
  requiredFeatureFlag?: FeatureFlagKey;
};
