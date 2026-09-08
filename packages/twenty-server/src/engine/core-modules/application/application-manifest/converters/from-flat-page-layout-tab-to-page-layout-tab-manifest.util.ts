import {
  type PageLayoutTabManifest,
  type PageLayoutWidgetManifest,
} from 'twenty-shared/application';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { type UniversalFlatPageLayoutTab } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-page-layout-tab.type';

export const fromFlatPageLayoutTabToPageLayoutTabManifest = ({
  flatPageLayoutTab,
  widgets = [],
}: {
  flatPageLayoutTab: UniversalFlatPageLayoutTab;
  widgets?: PageLayoutWidgetManifest[];
}): PageLayoutTabManifest => ({
  universalIdentifier: flatPageLayoutTab.universalIdentifier,
  title: flatPageLayoutTab.title,
  position: flatPageLayoutTab.position,
  ...(isDefined(flatPageLayoutTab.icon)
    ? { icon: flatPageLayoutTab.icon }
    : {}),
  layoutMode: flatPageLayoutTab.layoutMode,
  ...(isNonEmptyArray(widgets) ? { widgets } : {}),
});
