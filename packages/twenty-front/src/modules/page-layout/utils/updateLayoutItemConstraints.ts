import { type ResponsiveLayouts } from 'react-grid-layout';

export const updateLayoutItemConstraints = (
  layouts: ResponsiveLayouts,
  layoutItemId: string,
  constraints: { minW: number; minH: number },
): ResponsiveLayouts => ({
  desktop: layouts.desktop?.map((layoutItem) =>
    layoutItem.i === layoutItemId
      ? {
          ...layoutItem,
          minW: constraints.minW,
          minH: constraints.minH,
        }
      : layoutItem,
  ),
  mobile: layouts.mobile?.map((layoutItem) =>
    layoutItem.i === layoutItemId
      ? {
          ...layoutItem,
          minW: constraints.minW,
          minH: constraints.minH,
        }
      : layoutItem,
  ),
});
