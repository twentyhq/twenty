import { lazy } from 'react';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';

import { type SidePanelHostableRoute } from '@/side-panel/routing/types/SidePanelHostableRoute';
import { PermissionFlagType } from '~/generated-metadata/graphql';

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

export const SIDE_PANEL_HOSTABLE_ROUTES: SidePanelHostableRoute[] = [
  {
    path: getSettingsPath(SettingsPath.ObjectFieldEdit),
    element: <SettingsObjectFieldEdit />,
    settingsPermission: PermissionFlagType.DATA_MODEL,
  },
  {
    path: getSettingsPath(SettingsPath.ObjectDetail),
    element: <SettingsObjectDetailPage />,
    settingsPermission: PermissionFlagType.DATA_MODEL,
  },
];
