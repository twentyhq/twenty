import {
  type PageLayoutTabManifest,
  type PageLayoutWidgetManifest,
} from 'twenty-shared/application';

import { fromFlatPageLayoutTabToPageLayoutTabManifest } from 'src/engine/core-modules/application/application-manifest/converters/from-flat-page-layout-tab-to-page-layout-tab-manifest.util';
import { type UniversalFlatPageLayoutTab } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-page-layout-tab.type';

export const fromFlatPageLayoutTabToStandalonePageLayoutTabManifest = ({
  flatPageLayoutTab,
  widgets,
}: {
  flatPageLayoutTab: UniversalFlatPageLayoutTab;
  widgets?: PageLayoutWidgetManifest[];
}): PageLayoutTabManifest => {
  const { universalIdentifier, ...pageLayoutTabManifest } =
    fromFlatPageLayoutTabToPageLayoutTabManifest({
      flatPageLayoutTab,
      widgets,
    });

  return {
    universalIdentifier,
    pageLayoutUniversalIdentifier:
      flatPageLayoutTab.pageLayoutUniversalIdentifier,
    ...pageLayoutTabManifest,
  };
};
