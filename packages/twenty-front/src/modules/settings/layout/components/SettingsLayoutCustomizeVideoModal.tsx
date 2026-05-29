import {
  SettingsCustomizeVideoModal,
  type SettingsCustomizeVideoModalTab,
} from '@/settings/components/SettingsCustomizeVideoModal';
import { useLingui } from '@lingui/react/macro';
import { useMemo } from 'react';
import {
  IconAppWindow,
  IconCommand,
  IconLayoutDashboard,
  IconLayoutSidebarLeftExpand,
  IconTable,
} from 'twenty-ui/display';
import customizeSidebarVideo from '~/pages/settings/layout/assets/customize-sidebar.webm';

export const SETTINGS_LAYOUT_CUSTOMIZE_VIDEO_MODAL_ID =
  'settings-layout-customize-video-modal';

const SETTINGS_LAYOUT_CUSTOMIZE_VIDEO_TABS_INSTANCE_ID =
  'settings-layout-customize-video-tabs';

export const SettingsLayoutCustomizeVideoModal = () => {
  const { t } = useLingui();

  // Only the sidebar walkthrough is shipped in this PR — the other tabs reuse
  // the same source as a placeholder so the design is wired end-to-end.
  // Replace each entry's videoSrc when its matching recording lands.
  const tabs = useMemo<SettingsCustomizeVideoModalTab[]>(
    () => [
      {
        id: 'sidebar',
        title: t`Sidebar`,
        Icon: IconLayoutSidebarLeftExpand,
        videoSrc: customizeSidebarVideo,
      },
      {
        id: 'record-page',
        title: t`Record page`,
        Icon: IconAppWindow,
        videoSrc: customizeSidebarVideo,
      },
      {
        id: 'command-menu',
        title: t`Command menu`,
        Icon: IconCommand,
        videoSrc: customizeSidebarVideo,
      },
      {
        id: 'views',
        title: t`Views`,
        Icon: IconTable,
        videoSrc: customizeSidebarVideo,
      },
      {
        id: 'dashboards',
        title: t`Dashboards`,
        Icon: IconLayoutDashboard,
        videoSrc: customizeSidebarVideo,
      },
    ],
    [t],
  );

  return (
    <SettingsCustomizeVideoModal
      modalInstanceId={SETTINGS_LAYOUT_CUSTOMIZE_VIDEO_MODAL_ID}
      tabsInstanceId={SETTINGS_LAYOUT_CUSTOMIZE_VIDEO_TABS_INSTANCE_ID}
      tabs={tabs}
    />
  );
};
