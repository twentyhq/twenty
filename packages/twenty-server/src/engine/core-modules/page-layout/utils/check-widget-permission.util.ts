import type { ObjectsPermissions } from 'twenty-shared/types';

import type { PageLayoutWidgetDTO } from 'src/engine/core-modules/page-layout/dtos/page-layout-widget.dto';

export type WidgetWithPermission = PageLayoutWidgetDTO & {
  canReadWidget: boolean;
};

export const checkWidgetPermission = (
  widget: PageLayoutWidgetDTO,
  userObjectPermissions: ObjectsPermissions,
): WidgetWithPermission => {
  // If no objectMetadataId, no permission check needed - widget is readable
  if (!widget.objectMetadataId) {
    return {
      ...widget,
      configuration: widget.configuration,
      canReadWidget: true, // No permission restriction
    };
  }

  // Check permissions for widgets with objectMetadataId
  const objectPermission = userObjectPermissions[widget.objectMetadataId];
  const canReadWidget = objectPermission?.canReadObjectRecords === true;

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
