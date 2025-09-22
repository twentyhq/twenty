import type { ObjectsPermissions } from 'twenty-shared/types';

import type { PageLayoutWidgetDTO } from 'src/engine/core-modules/page-layout/dtos/page-layout-widget.dto';

export const applyPermissionsToWidget = (
  widget: PageLayoutWidgetDTO,
  userObjectPermissions: ObjectsPermissions,
): PageLayoutWidgetDTO => {
  if (!widget.objectMetadataId) {
    return {
      ...widget,
      configuration: widget.configuration,
      canReadWidget: true,
    };
  }

  const objectPermission = userObjectPermissions[widget.objectMetadataId];
  const canReadWidget = objectPermission?.canReadObjectRecords === true;

  return {
    ...widget,
    configuration: canReadWidget ? widget.configuration : null,
    canReadWidget,
  };
};
