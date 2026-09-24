import { type PageLayoutWidgetManifest } from 'twenty-shared/application';
import { PageLayoutTabLayoutMode } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type UniversalFlatPageLayoutWidget } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-page-layout-widget.type';

const getPositionProperties = ({
  position,
  isPositionImpliedByOrder,
}: {
  position: UniversalFlatPageLayoutWidget['position'];
  isPositionImpliedByOrder: boolean;
}): Pick<PageLayoutWidgetManifest, 'position' | 'heightBehavior'> => {
  if (!isDefined(position)) {
    return {};
  }

  if (
    !isPositionImpliedByOrder ||
    position.layoutMode !== PageLayoutTabLayoutMode.VERTICAL_LIST
  ) {
    return { position };
  }

  return isDefined(position.heightBehavior)
    ? { heightBehavior: position.heightBehavior }
    : {};
};

export const fromFlatPageLayoutWidgetToPageLayoutWidgetManifest = ({
  flatPageLayoutWidget,
  isPositionImpliedByOrder = false,
}: {
  flatPageLayoutWidget: UniversalFlatPageLayoutWidget;
  isPositionImpliedByOrder?: boolean;
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
  ...getPositionProperties({
    position: flatPageLayoutWidget.position,
    isPositionImpliedByOrder,
  }),
  configuration: flatPageLayoutWidget.universalConfiguration,
});
