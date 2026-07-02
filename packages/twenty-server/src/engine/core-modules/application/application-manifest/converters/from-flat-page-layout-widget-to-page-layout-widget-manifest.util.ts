import { type PageLayoutWidgetManifest } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';

export const fromFlatPageLayoutWidgetToPageLayoutWidgetManifest = ({
  flatPageLayoutWidget,
}: {
  flatPageLayoutWidget: FlatPageLayoutWidget;
}): PageLayoutWidgetManifest => {
  return {
    universalIdentifier: flatPageLayoutWidget.universalIdentifier,
    title: flatPageLayoutWidget.title,
    type: flatPageLayoutWidget.type,
    ...(isDefined(flatPageLayoutWidget.objectMetadataUniversalIdentifier)
      ? {
          objectUniversalIdentifier:
            flatPageLayoutWidget.objectMetadataUniversalIdentifier,
        }
      : {}),
    ...(isDefined(flatPageLayoutWidget.gridPosition)
      ? { gridPosition: flatPageLayoutWidget.gridPosition }
      : {}),
    ...(isDefined(flatPageLayoutWidget.conditionalDisplay)
      ? { conditionalDisplay: flatPageLayoutWidget.conditionalDisplay }
      : {}),
    ...(flatPageLayoutWidget.isActive === false ? { isActive: false } : {}),
    configuration: flatPageLayoutWidget.universalConfiguration,
  };
};
