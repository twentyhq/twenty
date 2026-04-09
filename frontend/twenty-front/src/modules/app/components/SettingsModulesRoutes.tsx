import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import {
  H2Title,
  Section,
  SettingsPageSkeletonLoader,
} from 'twenty-ui';
import { useTranslation } from 'react-i18next';
import { Navigate, Route, Routes } from 'react-router-dom';
import { SettingsProtectedRouteWrapper } from '@/settings/components/SettingsProtectedRouteWrapper';

const SettingsPipelineMain = lazy(() =>
  import('~/pages/settings/pipeline/SettingsPipeline').then((module) => ({
    default: module.SettingsPipeline,
  })),
);

const SettingsPipelineDeal = lazy(() =>
  import('~/pages/settings/pipeline/SettingsPipelineDeal').then((module) => ({
    default: module.SettingsPipelineDeal,
  })),
);

const SettingsMarketingMain = lazy(() =>
  import('~/pages/settings/marketing/SettingsMarketing').then((module) => ({
    default: module.SettingsMarketing,
  })),
);

const SettingsSupportMain = lazy(() =>
  import('~/pages/settings/support/SettingsSupport').then((module) => ({
    default: module.SettingsSupport,
  })),
);

const SettingsProjectsMain = lazy(() =>
  import('~/pages/settings/projects/SettingsProjects').then((module) => ({
    default: module.SettingsProjects,
  })),
);

const SettingsGamificationMain = lazy(() =>
  import('~/pages/settings/gamification/SettingsGamification').then(
    (module) => ({ default: module.SettingsGamification }),
  )
);

const SettingsBIMain = lazy(() =>
  import('~/pages/settings/bi/SettingsBI').then((module) => ({
    default: module.SettingsBI,
  })),
);

const SettingsInventoryMain = lazy(() =>
  import('~/pages/settings/inventory/SettingsInventory').then((module) => ({
    default: module.SettingsInventory,
  })),
);

const SettingsOmnichannelMain = lazy(() =>
  import('~/pages/settings/omnichannel/SettingsOmnichannel').then((module) => ({
    default: module.SettingsOmnichannel,
  })),
);

const SettingsMarketplaceMain = lazy(() =>
  import('~/pages/settings/marketplace/SettingsMarketplace').then((module) => ({
    default: module.SettingsMarketplace,
  })),
);

const SettingsIntegrationsMain = lazy(() =>
  import('~/pages/settings/integrations/SettingsIntegrations').then((module) => ({
    default: module.SettingsIntegrations,
  })),
);

const SettingsIntegrationsDetail = lazy(() =>
  import('~/pages/settings/integrations/SettingsIntegrationsDetail').then(
    (module) => ({ default: module.SettingsIntegrationsDetail }),
  ),
);

export const SettingsModulesRoutes = () => (
  <Suspense fallback={<SettingsPageSkeletonLoader />}>
    <Routes>
      <Route path={SettingsPath.Pipeline} element={<SettingsPipelineMain />} />
      <Route
        path={SettingsPath.PipelineDeal}
        element={<SettingsPipelineDeal />}
      />
      <Route path={SettingsPath.Marketing} element={<SettingsMarketingMain />} />
      <Route
        path={SettingsPath.MarketingCampaignDetail}
        element={<SettingsMarketingMain />}
      />
      <Route path={SettingsPath.Support} element={<SettingsSupportMain />} />
      <Route
        path={SettingsPath.SupportTicketDetail}
        element={<SettingsSupportMain />}
      />
      <Route path={SettingsPath.Projects} element={<SettingsProjectsMain />} />
      <Route
        path={SettingsPath.ProjectDetail}
        element={<SettingsProjectsMain />}
      />
      <Route
        path={SettingsPath.Gamification}
        element={<SettingsGamificationMain />}
      />
      <Route path={SettingsPath.BI} element={<SettingsBIMain />} />
      <Route path={SettingsPath.Inventory} element={<SettingsInventoryMain />} />
      <Route
        path={SettingsPath.Omnichannel}
        element={<SettingsOmnichannelMain />}
      />
      <Route
        path={SettingsPath.Marketplace}
        element={<SettingsMarketplaceMain />}
      />
      <Route path={SettingsPath.Integrations} element={<SettingsIntegrationsMain />} />
      <Route
        path={SettingsPath.IntegrationsDetail}
        element={<SettingsIntegrationsDetail />}
      />
    </Routes>
  </Suspense>
);
