import { permissionFlagMapSelector } from '@/settings/roles/states/permissionFlagMapSelector';
import { type SettingsTabDefinition } from '@/settings/types/SettingsTabDefinition';
import { getAvailableSettingsTabs } from '@/settings/utils/getAvailableSettingsTabs';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useWorkspaceFeatureFlagsMap } from '@/workspace/hooks/useWorkspaceFeatureFlagsMap';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';

export const useAvailableSettingsTabs = (
  tabs: readonly SettingsTabDefinition[],
) => {
  const { i18n } = useLingui();
  const permissionFlagMap = useAtomStateValue(permissionFlagMapSelector);
  const featureFlagsMap = useWorkspaceFeatureFlagsMap();

  return getAvailableSettingsTabs({
    tabs,
    permissionFlagMap,
    featureFlagsMap,
  }).map(({ id, title, Icon, pill }) => ({
    id,
    title: i18n._(title),
    Icon,
    pill: isDefined(pill) ? i18n._(pill) : undefined,
  }));
};
