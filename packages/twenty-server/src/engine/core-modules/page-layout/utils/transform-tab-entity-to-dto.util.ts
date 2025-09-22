import type { ObjectsPermissions } from 'twenty-shared/types';

import type { PageLayoutTabDTO } from 'src/engine/core-modules/page-layout/dtos/page-layout-tab.dto';
import type { PageLayoutTabEntity } from 'src/engine/core-modules/page-layout/entities/page-layout-tab.entity';
import { transformWidgetEntityToDTO } from 'src/engine/core-modules/page-layout/utils/transform-widget-entity-to-dto.util';

export const transformTabEntityToDTO = (
  tab: PageLayoutTabEntity,
  objectPermissions: ObjectsPermissions,
): PageLayoutTabDTO => {
  const widgetsWithPermissions = tab.widgets?.map((widget) =>
    transformWidgetEntityToDTO(widget, objectPermissions),
  );

  return {
    id: tab.id,
    title: tab.title,
    position: tab.position,
    pageLayoutId: tab.pageLayoutId,
    createdAt: tab.createdAt,
    updatedAt: tab.updatedAt,
    deletedAt: tab.deletedAt,
    widgets: widgetsWithPermissions,
  };
};
