import { getApplicationDisplayName } from '@/applications/utils/getApplicationDisplayName';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useApplicationsWithPreferences } from '@/settings/app-preferences/hooks/useApplicationsWithPreferences';
import { type ConnectedAccountGroup } from '@/settings/app-preferences/types/ConnectedAccountGroup';
import { getAccountGroupApplicationsWithSettings } from '@/settings/app-preferences/utils/getAccountGroupApplicationsWithSettings';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/icon/provider';

export const useAccountGroupApplicationSettingsTabs = (
  group: ConnectedAccountGroup | undefined,
) => {
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const { applicationsWithPreferences, loading } =
    useApplicationsWithPreferences();

  const applicationsWithSettings = isDefined(group)
    ? getAccountGroupApplicationsWithSettings({
        group,
        applicationsWithPreferences,
      })
    : [];

  const applicationSettingsTabs = applicationsWithSettings.flatMap(
    ({ application, settingsMenuItems }) => {
      const applicationName = getApplicationDisplayName({
        application,
        currentWorkspace,
      });

      return settingsMenuItems.map((settingsMenuItem) => {
        const settingsMenuItemTitle = settingsMenuItem.title;

        return {
          frontComponentId: settingsMenuItem.frontComponentId,
          tab: {
            id: settingsMenuItem.universalIdentifier,
            title:
              settingsMenuItems.length > 1
                ? t`${applicationName}: ${settingsMenuItemTitle}`
                : applicationName,
            Icon: getIcon(settingsMenuItem.icon, 'IconAdjustments'),
          },
        };
      });
    },
  );

  return { applicationSettingsTabs, loading };
};
