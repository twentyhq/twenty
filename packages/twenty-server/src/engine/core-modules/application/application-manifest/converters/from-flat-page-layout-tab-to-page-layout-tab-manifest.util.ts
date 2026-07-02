import {
  type PageLayoutTabManifest,
  type PageLayoutWidgetManifest,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { type FlatPageLayoutTab } from 'src/engine/metadata-modules/flat-page-layout-tab/types/flat-page-layout-tab.type';

export const fromFlatPageLayoutTabToPageLayoutTabManifest = ({
  flatPageLayoutTab,
  widgets,
}: {
  flatPageLayoutTab: FlatPageLayoutTab;
  widgets: PageLayoutWidgetManifest[];
}): PageLayoutTabManifest => {
  return {
    universalIdentifier: flatPageLayoutTab.universalIdentifier,
    title: flatPageLayoutTab.title,
    position: flatPageLayoutTab.position,
    ...(isDefined(flatPageLayoutTab.icon)
      ? { icon: flatPageLayoutTab.icon }
      : {}),
    ...(isDefined(flatPageLayoutTab.layoutMode)
      ? { layoutMode: flatPageLayoutTab.layoutMode }
      : {}),
    ...(flatPageLayoutTab.isActive === false ? { isActive: false } : {}),
    widgets,
  };
};
