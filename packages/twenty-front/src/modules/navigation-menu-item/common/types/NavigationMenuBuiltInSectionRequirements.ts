import {
  type FeatureFlagKey,
  type PermissionFlagType,
} from '~/generated-metadata/graphql';

export type NavigationMenuBuiltInSectionRequirements = {
  requiredPermissionFlag?: PermissionFlagType;
  requiredFeatureFlag?: FeatureFlagKey;
};
