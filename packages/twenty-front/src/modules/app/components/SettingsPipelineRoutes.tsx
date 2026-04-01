import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { H2Title, Section, SettingsPageSkeletonLoader } from 'twenty-ui';
import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

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

export const SettingsPipelineRoutes = () => (
  <Suspense fallback={<SettingsPageSkeletonLoader />}>
    <Routes>
      <Route path={SettingsPath.Pipeline} element={<SettingsPipelineMain />} />
      <Route
        path={SettingsPath.PipelineDeal}
        element={<SettingsPipelineDeal />}
      />
    </Routes>
  </Suspense>
);
