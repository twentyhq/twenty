import { lazy } from 'react';
import { AppPath, SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';

import { type SidePanelHostableRoute } from '@/side-panel/routing/types/SidePanelHostableRoute';
import { SETTINGS_DATA_MODEL_PERMISSION } from '@/settings/constants/SettingsDataModelPermission';

// Loaded lazily like the main route tree does it, so hosting a page in the
// panel never pulls it into the bundle of everything that renders a panel.
const SettingsObjectDetailPage = lazy(() =>
  import('~/pages/settings/data-model/SettingsObjectDetailPage').then(
    (module) => ({ default: module.SettingsObjectDetailPage }),
  ),
);

const SettingsObjectFieldEdit = lazy(() =>
  import('~/pages/settings/data-model/SettingsObjectFieldEdit').then(
    (module) => ({ default: module.SettingsObjectFieldEdit }),
  ),
);

const RecordIndexPage = lazy(() =>
  import('~/pages/object-record/RecordIndexPage').then((module) => ({
    default: module.RecordIndexPage,
  })),
);

export const SIDE_PANEL_HOSTABLE_ROUTES: SidePanelHostableRoute[] = [
  {
    path: getSettingsPath(SettingsPath.ObjectFieldEdit),
    element: <SettingsObjectFieldEdit />,
    settingsPermission: SETTINGS_DATA_MODEL_PERMISSION,
  },
  {
    path: getSettingsPath(SettingsPath.ObjectDetail),
    element: <SettingsObjectDetailPage />,
    settingsPermission: SETTINGS_DATA_MODEL_PERMISSION,
  },
  {
    path: AppPath.RecordIndexPage,
    element: <RecordIndexPage />,
  },
];
