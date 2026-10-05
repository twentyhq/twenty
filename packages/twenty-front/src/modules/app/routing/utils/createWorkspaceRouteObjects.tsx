import { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import { AppPath, SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';

import { LazyRoute } from '@/app/components/LazyRoute';
import {
  createSettingsRouteObjects,
  SettingsRouteOutlet,
} from '@/app/components/SettingsRoutes';
import { type WorkspaceRouteObject } from '@/app/routing/types/WorkspaceRouteObject';
import { RecordIndexSkeletonLoader } from '@/object-record/record-index/components/RecordIndexSkeletonLoader';

const AgentCoreIndexPage = lazy(() =>
  import('~/pages/object-core/AgentCoreIndexPage').then((module) => ({
    default: module.AgentCoreIndexPage,
  })),
);

const AgentCoreShowPage = lazy(() =>
  import('~/pages/object-core/AgentCoreShowPage').then((module) => ({
    default: module.AgentCoreShowPage,
  })),
);

const WorkflowCoreShowPage = lazy(() =>
  import('~/pages/object-core/WorkflowCoreShowPage').then((module) => ({
    default: module.WorkflowCoreShowPage,
  })),
);

const RecordIndexPage = lazy(() =>
  import('~/pages/object-record/RecordIndexPage').then((module) => ({
    default: module.RecordIndexPage,
  })),
);

const RecordShowPage = lazy(() =>
  import('~/pages/object-record/RecordShowPage').then((module) => ({
    default: module.RecordShowPage,
  })),
);

const StandalonePageLayoutPage = lazy(() =>
  import('~/pages/page-layout/StandalonePageLayoutPage').then((module) => ({
    default: module.StandalonePageLayoutPage,
  })),
);

const AiChatPage = lazy(() =>
  import('~/pages/ai-chat/AiChatPage').then((module) => ({
    default: module.AiChatPage,
  })),
);

const AiChatInboxPage = lazy(() =>
  import('~/pages/ai-chat/AiChatInboxPage').then((module) => ({
    default: module.AiChatInboxPage,
  })),
);

const MobileHomePage = lazy(() =>
  import('~/pages/mobile-home/MobileHomePage').then((module) => ({
    default: module.MobileHomePage,
  })),
);

const NotFound = lazy(() =>
  import('~/pages/not-found/NotFound').then((module) => ({
    default: module.NotFound,
  })),
);

type CreateWorkspaceRouteObjectsArgs = {
  isAdminPageEnabled?: boolean;
};

const MAIN_AND_SIDE_PANEL = ['main', 'side-panel'] as const;
const SETTINGS_ROOT_PATH = AppPath.SettingsCatchAll.replace('/*', '');

export const createWorkspaceRouteObjects = ({
  isAdminPageEnabled,
}: CreateWorkspaceRouteObjectsArgs): WorkspaceRouteObject[] => {
  const settingsRouteObjects = createSettingsRouteObjects({
    isAdminPageEnabled,
  });

  return [
    {
      path: AppPath.WorkflowCoreShowPage,
      element: (
        <LazyRoute>
          <WorkflowCoreShowPage />
        </LazyRoute>
      ),
      handle: {
        workspaceSurfaces: MAIN_AND_SIDE_PANEL,
        isLocationExpandableFromSidePanel: true,
      },
    },
    {
      path: AppPath.AgentIndexPage,
      element: (
        <LazyRoute fallback={<RecordIndexSkeletonLoader />}>
          <AgentCoreIndexPage />
        </LazyRoute>
      ),
    },
    {
      path: AppPath.AgentShowPage,
      element: (
        <LazyRoute>
          <AgentCoreShowPage />
        </LazyRoute>
      ),
    },
    {
      path: AppPath.Index,
      element: <RecordIndexSkeletonLoader />,
    },
    {
      path: AppPath.RecordIndexPage,
      element: (
        <LazyRoute fallback={<RecordIndexSkeletonLoader />}>
          <RecordIndexPage />
        </LazyRoute>
      ),
      handle: {
        workspaceSurfaces: MAIN_AND_SIDE_PANEL,
        isLocationExpandableFromSidePanel: true,
      },
    },
    {
      path: AppPath.RecordShowPage,
      element: (
        <LazyRoute>
          <RecordShowPage />
        </LazyRoute>
      ),
      handle: { workspaceSurfaces: MAIN_AND_SIDE_PANEL },
    },
    {
      path: AppPath.PageLayoutPage,
      element: (
        <LazyRoute>
          <StandalonePageLayoutPage />
        </LazyRoute>
      ),
    },
    {
      path: AppPath.AiChat,
      element: (
        <LazyRoute>
          <AiChatPage />
        </LazyRoute>
      ),
    },
    {
      path: AppPath.AiChatInbox,
      element: (
        <LazyRoute>
          <AiChatInboxPage />
        </LazyRoute>
      ),
    },
    {
      path: AppPath.Home,
      element: (
        <LazyRoute>
          <MobileHomePage />
        </LazyRoute>
      ),
    },
    {
      path: SETTINGS_ROOT_PATH,
      element: <SettingsRouteOutlet />,
      children: settingsRouteObjects,
    },
    {
      path: AppPath.Dpa,
      element: <Navigate to={getSettingsPath(SettingsPath.LegalDpa)} replace />,
    },
    {
      path: AppPath.NotFoundWildcard,
      element: (
        <LazyRoute>
          <NotFound />
        </LazyRoute>
      ),
    },
  ];
};
