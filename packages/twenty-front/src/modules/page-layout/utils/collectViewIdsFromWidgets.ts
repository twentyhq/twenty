import { isDefined } from 'twenty-shared/utils';

import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { getWidgetConfigurationViewId } from '@/page-layout/utils/getWidgetConfigurationViewId';

export const collectViewIdsFromWidgets = (
  widgets: PageLayoutWidget[],
): Set<string> => {
  const viewIds = new Set<string>();

  for (const widget of widgets) {
    const viewId = getWidgetConfigurationViewId(widget.configuration);

    if (isDefined(viewId)) {
      viewIds.add(viewId);
    }
  }

  return viewIds;
};
