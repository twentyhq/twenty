import { SettingsLabContent } from '@/settings/lab/components/SettingsLabContent';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { SETTINGS_RELEASES_TABS, SETTINGS_RELEASES_TABS_ID } from '../constants';
import { SettingsReleasesChangelogContent } from './SettingsReleasesChangelogContent';

export const SettingsReleasesTabContent = () => {
  const activeTabId = useRecoilComponentValue(
    activeTabIdComponentState,
    SETTINGS_RELEASES_TABS_ID,
  );

  switch (activeTabId) {
    case SETTINGS_RELEASES_TABS.CHANGELOG:
      return <SettingsReleasesChangelogContent />;
    case SETTINGS_RELEASES_TABS.LAB:
      return <SettingsLabContent />;
    default:
      return <SettingsReleasesChangelogContent />;
  }
};
