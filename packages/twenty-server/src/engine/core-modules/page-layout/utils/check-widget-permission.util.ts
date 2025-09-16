import type { ObjectsPermissions } from 'twenty-shared/types';

import type { PageLayoutWidgetDTO } from 'src/engine/core-modules/page-layout/dtos/page-layout-widget.dto';

export type WidgetWithPermission = PageLayoutWidgetDTO & {
  canReadWidget: boolean;
};

export const checkWidgetPermission = (
  widget: PageLayoutWidgetDTO,
  userObjectPermissions: ObjectsPermissions,
): WidgetWithPermission => {
  let canReadWidget = true;

  if (widget.objectMetadataId) {
    const objectPermission = userObjectPermissions[widget.objectMetadataId];

    canReadWidget = objectPermission?.canReadObjectRecords === true;
  }

  return {
    ...widget,
    configuration: canReadWidget ? widget.configuration : null,
    canReadWidget,
  };
};

export const checkWidgetsPermissions = (
  widgets: PageLayoutWidgetDTO[],
  userObjectPermissions: ObjectsPermissions,
): WidgetWithPermission[] => {
  return widgets.map((widget) =>
    checkWidgetPermission(widget, userObjectPermissions),
  );
};
