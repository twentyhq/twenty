import { type SettingsTabDefinition } from '@/settings/types/SettingsTabDefinition';
import { isDefined } from 'twenty-shared/utils';
import { type PermissionFlagType } from '~/generated-metadata/graphql';

export const getAvailableSettingsTabs = ({
  tabs,
  permissionFlagMap,
}: {
  tabs: readonly SettingsTabDefinition[];
  permissionFlagMap: Record<PermissionFlagType, boolean>;
}) =>
  tabs.filter(
    ({ settingsPermission }) =>
      !isDefined(settingsPermission) || permissionFlagMap[settingsPermission],
  );
