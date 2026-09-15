import { type PageLayoutWidgetManifest } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { type UniversalFlatPageLayoutWidget } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-page-layout-widget.type';

export const fromFlatPageLayoutWidgetToPageLayoutWidgetManifest = ({
  flatPageLayoutWidget,
}: {
  flatPageLayoutWidget: UniversalFlatPageLayoutWidget;
}): PageLayoutWidgetManifest => ({
  universalIdentifier: flatPageLayoutWidget.universalIdentifier,
  title: flatPageLayoutWidget.title,
  type: flatPageLayoutWidget.type,
  ...(isDefined(flatPageLayoutWidget.objectMetadataUniversalIdentifier)
    ? {
        objectUniversalIdentifier:
          flatPageLayoutWidget.objectMetadataUniversalIdentifier,
      }
    : {}),
  ...(isDefined(flatPageLayoutWidget.conditionalDisplay)
    ? { conditionalDisplay: flatPageLayoutWidget.conditionalDisplay }
    : {}),
  ...(isDefined(flatPageLayoutWidget.position)
    ? { position: flatPageLayoutWidget.position }
    : {}),
  configuration: flatPageLayoutWidget.universalConfiguration,
});
