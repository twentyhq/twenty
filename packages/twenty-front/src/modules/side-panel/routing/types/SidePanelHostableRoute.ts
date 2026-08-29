import { type ReactElement } from 'react';

import { type PermissionFlagType } from '~/generated-metadata/graphql';

// A route the side panel can host next to the main outlet. Declaring one here
// is what makes a path openable on the right, so the permission gating of the
// matching main route has to be repeated: the panel renders the route element
// directly and never goes through its SettingsProtectedRouteWrapper.
export type SidePanelHostableRoute = {
  path: string;
  element: ReactElement;
  settingsPermission?: PermissionFlagType;
};
