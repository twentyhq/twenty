import {
  SettingsCustomizeVideoModal,
  type SettingsCustomizeVideoModalTab,
} from '@/settings/components/SettingsCustomizeVideoModal';
import { useLingui } from '@lingui/react/macro';
import { useMemo } from 'react';
import { IconHierarchy2, IconLink, IconList } from 'twenty-ui/display';
// Placeholder source — the data-model walkthrough recordings haven't landed yet, so
// every tab reuses the layout sidebar video. Replace each entry's videoSrc when
// per-topic recordings ship; the video files will then live alongside this folder.
import placeholderVideo from '~/pages/settings/layout/assets/customize-sidebar.webm';

export const SETTINGS_DATA_MODEL_VISUALIZE_VIDEO_MODAL_ID =
  'settings-data-model-visualize-video-modal';

const SETTINGS_DATA_MODEL_VISUALIZE_VIDEO_TABS_INSTANCE_ID =
  'settings-data-model-visualize-video-tabs';

export const SettingsDataModelVisualizeVideoModal = () => {
  const { t } = useLingui();

  const tabs = useMemo<SettingsCustomizeVideoModalTab[]>(
    () => [
      {
        id: 'objects',
        title: t`Objects`,
        Icon: IconHierarchy2,
        videoSrc: placeholderVideo,
      },
      {
        id: 'fields',
        title: t`Fields`,
        Icon: IconList,
        videoSrc: placeholderVideo,
      },
      {
        id: 'relations',
        title: t`Relations`,
        Icon: IconLink,
        videoSrc: placeholderVideo,
      },
    ],
    [t],
  );

  return (
    <SettingsCustomizeVideoModal
      modalInstanceId={SETTINGS_DATA_MODEL_VISUALIZE_VIDEO_MODAL_ID}
      tabsInstanceId={SETTINGS_DATA_MODEL_VISUALIZE_VIDEO_TABS_INSTANCE_ID}
      tabs={tabs}
    />
  );
};
