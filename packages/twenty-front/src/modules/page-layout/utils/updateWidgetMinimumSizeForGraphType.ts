import { getWidgetSize } from '@/page-layout/utils/getWidgetSize';
import { updateLayoutItemConstraints } from '@/page-layout/utils/updateLayoutItemConstraints';
import { type Layouts } from 'react-grid-layout';
import { isDefined } from 'twenty-shared/utils';
import { type WidgetConfigurationType } from '~/generated/graphql';

export const updateWidgetMinimumSizeForGraphType = ({
  configurationType,
  widgetId,
  tabId,
  currentLayouts,
}: {
  configurationType: WidgetConfigurationType;
  widgetId: string;
  tabId: string;
  currentLayouts: Record<string, Layouts>;
}): Record<string, Layouts> => {
  const minimumSize = getWidgetSize(configurationType, 'minimum');
  const currentTabLayouts = currentLayouts[tabId];

  if (!isDefined(currentTabLayouts)) {
    return currentLayouts;
  }

  const updatedTabLayouts = updateLayoutItemConstraints(
    currentTabLayouts,
    widgetId,
    { minW: minimumSize.w, minH: minimumSize.h },
  );

  return {
    ...currentLayouts,
    [tabId]: updatedTabLayouts,
  };
};
