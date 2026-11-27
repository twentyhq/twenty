import { type SettingsTabDefinition } from '@/settings/types/SettingsTabDefinition';
import { isSettingsRouteAccessible } from '@/settings/utils/isSettingsRouteAccessible';
import { isDefined } from 'twenty-shared/utils';
import { type PermissionFlagType } from '~/generated-metadata/graphql';

export const getAvailableSettingsTabs = ({
  tabs,
  permissionFlagMap,
  featureFlagsMap,
}: {
  tabs: readonly SettingsTabDefinition[];
  permissionFlagMap: Record<PermissionFlagType, boolean>;
  featureFlagsMap: Record<string, boolean>;
}) =>
  tabs.filter(({ settingsPermission, requiredFeatureFlag }) =>
    isSettingsRouteAccessible({
      hasPermission:
        !isDefined(settingsPermission) || permissionFlagMap[settingsPermission],
      requiredFeatureFlag,
      isRequiredFeatureFlagEnabled:
        isDefined(requiredFeatureFlag) && featureFlagsMap[requiredFeatureFlag],
    }),
  );
