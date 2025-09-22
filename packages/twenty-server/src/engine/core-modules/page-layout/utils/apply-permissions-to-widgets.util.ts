import type { ObjectsPermissions } from 'twenty-shared/types';

import type { PageLayoutWidgetDTO } from 'src/engine/core-modules/page-layout/dtos/page-layout-widget.dto';
import { applyPermissionsToWidget } from 'src/engine/core-modules/page-layout/utils/apply-permissions-to-widget.util';

export const applyPermissionsToWidgets = (
  widgets: PageLayoutWidgetDTO[],
  userObjectPermissions: ObjectsPermissions,
): PageLayoutWidgetDTO[] => {
  return widgets.map((widget) =>
    applyPermissionsToWidget(widget, userObjectPermissions),
  );
};
