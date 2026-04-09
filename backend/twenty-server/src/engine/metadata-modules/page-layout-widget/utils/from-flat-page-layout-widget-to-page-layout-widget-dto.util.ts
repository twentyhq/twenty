import { isDefined } from 'twenty-shared/utils';

import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { type PageLayoutWidgetDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/page-layout-widget.dto';

export const fromFlatPageLayoutWidgetToPageLayoutWidgetDto = (
  flatPageLayoutWidget: FlatPageLayoutWidget,
): PageLayoutWidgetDTO => {
  const { createdAt, updatedAt, deletedAt, objectMetadataId, ...rest } =
    flatPageLayoutWidget;

  return {
    ...rest,
    isOverridden:
      isDefined(rest.overrides) && Object.keys(rest.overrides).length > 0,
    objectMetadataId: objectMetadataId ?? undefined,
    createdAt: new Date(createdAt),
    updatedAt: new Date(updatedAt),
    deletedAt: deletedAt ? new Date(deletedAt) : undefined,
  };
};
