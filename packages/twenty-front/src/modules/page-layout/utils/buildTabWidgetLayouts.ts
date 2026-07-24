import { type Layouts } from 'react-grid-layout';
import { DEFAULT_WIDGET_SIZE } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import { WIDGET_SIZES } from '@/page-layout/constants/WidgetSizes';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { getWidgetGridPosition } from '@/page-layout/utils/getWidgetGridPosition';
import { getWidgetSize } from '@/page-layout/utils/getWidgetSize';

const getWidgetMinimumSize = (widget: PageLayoutWidget) => {
  const typeMinimum = WIDGET_SIZES[widget.type]?.minimum;

  if (isDefined(typeMinimum)) {
    return typeMinimum;
  }

  if (
    isDefined(widget.configuration) &&
    widget.configuration.__typename !== 'FieldsConfiguration'
  ) {
    return getWidgetSize(widget.configuration.configurationType, 'minimum');
  }

  return DEFAULT_WIDGET_SIZE.minimum;
};

export const buildTabWidgetLayouts = (widgets: PageLayoutWidget[]): Layouts => {
  const layouts = widgets.map((widget) => {
    const minimumSize = getWidgetMinimumSize(widget);
    const gridPos = getWidgetGridPosition(widget);

    return {
      i: widget.id,
      x: gridPos?.column ?? 0,
      y: gridPos?.row ?? 0,
      w: gridPos?.columnSpan ?? DEFAULT_WIDGET_SIZE.default.w,
      h: gridPos?.rowSpan ?? DEFAULT_WIDGET_SIZE.default.h,
      minW: minimumSize.w,
      minH: minimumSize.h,
    };
  });

  return {
    desktop: layouts,
    mobile: layouts.map((layout) => ({ ...layout, w: 1, x: 0 })),
  };
};
