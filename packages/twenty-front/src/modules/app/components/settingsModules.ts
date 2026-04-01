import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';

import { SettingsPageSkeletonLoader } from '@/settings/components/SettingsPageSkeletonLoader';
import { lazy } from 'react';

const SettingsPipeline = lazy(() =>
  import('~/pages/settings/pipeline/SettingsPipeline').then((module) => ({
    default: module.SettingsPipeline,
  })),
);

const SettingsMarketing = lazy(() =>
  import('~/pages/settings/marketing/SettingsMarketing').then((module) => ({
    default: module.SettingsMarketing,
  })),
);

const SettingsSupport = lazy(() =>
  import('~/pages/settings/support/SettingsSupport').then((module) => ({
    default: module.SettingsSupport,
  })),
);

const SettingsProjects = lazy(() =>
  import('~/pages/settings/projects/SettingsProjects').then((module) => ({
    default: module.SettingsProjects,
  })),
);

const SettingsGamification = lazy(() =>
  import('~/pages/settings/gamification/SettingsGamification').then((module) => ({
    default: module.SettingsGamification,
  })),
);

const SettingsBI = lazy(() =>
  import('~/pages/settings/bi/SettingsBI').then((module) => ({
    default: module.SettingsBI,
  })),
);

const SettingsInventory = lazy(() =>
  import('~/pages/settings/inventory/SettingsInventory').then((module) => ({
    default: module.SettingsInventory,
  })),
);

const SettingsOmnichannel = lazy(() =>
  import('~/pages/settings/omnichannel/SettingsOmnichannel').then((module) => ({
    default: module.SettingsOmnichannel,
  })),
);

const SettingsMarketplace = lazy(() =>
  import('~/pages/settings/marketplace/SettingsMarketplace').then((module) => ({
    default: module.SettingsMarketplace,
  })),
);

const SettingsIntegrationsDetail = lazy(() =>
  import('~/pages/settings/integrations/SettingsIntegrationsDetail').then(
    (module) => ({ default: module.SettingsIntegrationsDetail }),
  ),
);

export const settingsModules = {
  SettingsPipeline,
  SettingsMarketing,
  SettingsSupport,
  SettingsProjects,
  SettingsGamification,
  SettingsBI,
  SettingsInventory,
  SettingsOmnichannel,
  SettingsMarketplace,
  SettingsIntegrationsDetail,
};
