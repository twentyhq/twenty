import { type SettingsSearchAvailability } from '@/settings/search/types/SettingsSearchAvailability';
import { type SettingsSearchRoute } from '@/settings/search/types/SettingsSearchRoute';
import { isSettingsRouteAccessible } from '@/settings/utils/isSettingsRouteAccessible';
import { isDefined } from 'twenty-shared/utils';

export const isSettingsSearchRouteAvailable = ({
  route: { metadata, guards },
  availability,
}: {
  route: SettingsSearchRoute;
  availability: SettingsSearchAvailability;
}) =>
  (availability.isBillingEnabled || !metadata.isHiddenWhenBillingDisabled) &&
  guards.every(({ settingsPermission, requiredFeatureFlag }) =>
    isSettingsRouteAccessible({
      hasPermission: availability.permissionFlagMap[settingsPermission],
      requiredFeatureFlag,
      isRequiredFeatureFlagEnabled:
        isDefined(requiredFeatureFlag) &&
        availability.featureFlagsMap[requiredFeatureFlag],
    }),
  );
