import { type getDefaultStore } from 'jotai';
import { type ComponentType, type ReactElement } from 'react';
import { type PathMatch } from 'react-router-dom';

import { type SidePanelRoutedPageInfo } from '@/side-panel/routing/types/SidePanelRoutedPageInfo';
import { type PermissionFlagType } from '~/generated-metadata/graphql';

// Everything the panel needs to host a route lives in one entry, so adding a
// route is a single declaration rather than that plus a branch in the top bar,
// the title resolver and the gate. The permission of the matching main route
// has to be repeated here: the panel renders the element directly and never
// goes through its SettingsProtectedRouteWrapper.
export type SidePanelHostableRoute = {
  path: string;
  element: ReactElement;
  resolvePageInfo: (params: {
    match: PathMatch<string>;
    path: string;
    store: ReturnType<typeof getDefaultStore>;
  }) => SidePanelRoutedPageInfo;
  TopBarRightCorner?: ComponentType<{ match: PathMatch<string> }>;
  settingsPermission?: PermissionFlagType;
};
