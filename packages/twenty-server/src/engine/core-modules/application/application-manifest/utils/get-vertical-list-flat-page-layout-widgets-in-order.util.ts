import { PageLayoutTabLayoutMode } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type UniversalFlatPageLayoutWidget } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-page-layout-widget.type';

export const getVerticalListFlatPageLayoutWidgetsInOrder = <
  TFlatPageLayoutWidget extends Pick<UniversalFlatPageLayoutWidget, 'position'>,
>(
  flatPageLayoutWidgets: TFlatPageLayoutWidget[],
): TFlatPageLayoutWidget[] | undefined => {
  const indexedFlatPageLayoutWidgets = flatPageLayoutWidgets.flatMap(
    (flatPageLayoutWidget) =>
      isDefined(flatPageLayoutWidget.position) &&
      flatPageLayoutWidget.position.layoutMode ===
        PageLayoutTabLayoutMode.VERTICAL_LIST
        ? [
            {
              flatPageLayoutWidget,
              index: flatPageLayoutWidget.position.index,
            },
          ]
        : [],
  );

  if (indexedFlatPageLayoutWidgets.length !== flatPageLayoutWidgets.length) {
    return undefined;
  }

  const orderedFlatPageLayoutWidgets = indexedFlatPageLayoutWidgets
    .slice()
    .sort((left, right) => left.index - right.index);

  return orderedFlatPageLayoutWidgets.every(
    ({ index }, expectedIndex) => index === expectedIndex,
  )
    ? orderedFlatPageLayoutWidgets.map(
        ({ flatPageLayoutWidget }) => flatPageLayoutWidget,
      )
    : undefined;
};
