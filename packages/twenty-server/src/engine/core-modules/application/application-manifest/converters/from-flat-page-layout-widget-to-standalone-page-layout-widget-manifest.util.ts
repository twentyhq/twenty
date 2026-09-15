import { type StandalonePageLayoutWidgetManifest } from 'twenty-shared/application';

import { fromFlatPageLayoutWidgetToPageLayoutWidgetManifest } from 'src/engine/core-modules/application/application-manifest/converters/from-flat-page-layout-widget-to-page-layout-widget-manifest.util';
import { type UniversalFlatPageLayoutWidget } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-page-layout-widget.type';

export const fromFlatPageLayoutWidgetToStandalonePageLayoutWidgetManifest = ({
  flatPageLayoutWidget,
  position,
}: {
  flatPageLayoutWidget: UniversalFlatPageLayoutWidget;
  position: StandalonePageLayoutWidgetManifest['position'];
}): StandalonePageLayoutWidgetManifest => {
  const { universalIdentifier, ...pageLayoutWidgetManifest } =
    fromFlatPageLayoutWidgetToPageLayoutWidgetManifest({
      flatPageLayoutWidget,
    });

  return {
    universalIdentifier,
    pageLayoutTabUniversalIdentifier:
      flatPageLayoutWidget.pageLayoutTabUniversalIdentifier,
    ...pageLayoutWidgetManifest,
    position,
  };
};
