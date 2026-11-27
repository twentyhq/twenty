import { type SettingsTabDefinition } from '@/settings/types/SettingsTabDefinition';
import { isDefined } from 'twenty-shared/utils';
import { type PermissionFlagType } from '~/generated-metadata/graphql';

export const getAvailableSettingsTabs = <
  TTabDefinition extends Pick<SettingsTabDefinition, 'settingsPermission'>,
>({
  tabs,
  permissionFlagMap,
}: {
  tabs: readonly TTabDefinition[];
  permissionFlagMap: Record<PermissionFlagType, boolean>;
}) =>
  tabs.filter(
    ({ settingsPermission }) =>
      !isDefined(settingsPermission) || permissionFlagMap[settingsPermission],
  );
