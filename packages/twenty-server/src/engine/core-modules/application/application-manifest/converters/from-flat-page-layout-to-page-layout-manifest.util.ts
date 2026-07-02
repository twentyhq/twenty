import {
  type PageLayoutManifest,
  type PageLayoutTabManifest,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { type FlatPageLayout } from 'src/engine/metadata-modules/flat-page-layout/types/flat-page-layout.type';

export const fromFlatPageLayoutToPageLayoutManifest = ({
  flatPageLayout,
  tabs,
}: {
  flatPageLayout: FlatPageLayout;
  tabs: PageLayoutTabManifest[];
}): PageLayoutManifest => {
  return {
    universalIdentifier: flatPageLayout.universalIdentifier,
    name: flatPageLayout.name,
    type: flatPageLayout.type,
    ...(isDefined(flatPageLayout.objectMetadataUniversalIdentifier)
      ? {
          objectUniversalIdentifier:
            flatPageLayout.objectMetadataUniversalIdentifier,
        }
      : {}),
    ...(isDefined(
      flatPageLayout.defaultTabToFocusOnMobileAndSidePanelUniversalIdentifier,
    )
      ? {
          defaultTabToFocusOnMobileAndSidePanelUniversalIdentifier:
            flatPageLayout.defaultTabToFocusOnMobileAndSidePanelUniversalIdentifier,
        }
      : {}),
    tabs,
  };
};
