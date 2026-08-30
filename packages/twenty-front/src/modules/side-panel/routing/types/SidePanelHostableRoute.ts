import { type getDefaultStore } from 'jotai';
import { type ComponentType, type ReactElement } from 'react';
import { type PathMatch } from 'react-router-dom';

import { type SidePanelRoutedPageInfo } from '@/side-panel/routing/types/SidePanelRoutedPageInfo';
import {
  type FeatureFlagKey,
  type PermissionFlagType,
} from '~/generated-metadata/graphql';

// Everything the panel needs to host a route lives in one entry, so adding a
// route is a single declaration rather than that plus a branch in the top bar
// and the title resolver. The gate of the matching main route has to be
// restated here, since the panel renders the element directly rather than
// through its route tree; it is applied by the same wrapper, so the two can
// only differ in what they show on refusal.
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
  requiredFeatureFlag?: FeatureFlagKey;
};
