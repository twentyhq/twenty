import { isDefined } from 'twenty-shared/utils';
import { type FeatureFlagKey } from '~/generated-metadata/graphql';

export const isSettingsRouteAccessible = ({
  hasPermission,
  requiredFeatureFlag,
  isRequiredFeatureFlagEnabled,
}: {
  hasPermission: boolean;
  requiredFeatureFlag?: FeatureFlagKey;
  isRequiredFeatureFlagEnabled: boolean;
}) =>
  hasPermission &&
  (!isDefined(requiredFeatureFlag) || isRequiredFeatureFlagEnabled);
