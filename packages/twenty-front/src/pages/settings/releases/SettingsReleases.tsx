import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { t } from '@lingui/core/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { IconFlask, IconRocket } from 'twenty-ui/display';

import { SettingsReleasesTabContent } from './components';
import { SETTINGS_RELEASES_TABS, SETTINGS_RELEASES_TABS_ID } from './constants';

export const SettingsReleases = () => {
  const tabs = [
    {
      id: SETTINGS_RELEASES_TABS.CHANGELOG,
      title: t`Changelog`,
      Icon: IconRocket,
    },
    {
      id: SETTINGS_RELEASES_TABS.LAB,
      title: t`Lab`,
      Icon: IconFlask,
    },
  ];

  return (
    <SubMenuTopBarContainer
      title={t`Releases`}
      links={[
        {
          children: t`Other`,
          href: getSettingsPath(SettingsPath.Releases),
        },
        { children: t`Releases` },
      ]}
    >
      <SettingsPageContainer>
        <TabList
          tabs={tabs}
          behaveAsLinks={false}
          componentInstanceId={SETTINGS_RELEASES_TABS_ID}
        />
        <SettingsReleasesTabContent />
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
