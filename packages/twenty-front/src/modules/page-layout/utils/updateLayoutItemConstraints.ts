import { type Layouts } from 'react-grid-layout';

export const updateLayoutItemConstraints = (
  layouts: Layouts,
  layoutItemId: string,
  constraints: { minW: number; minH: number },
): Layouts => ({
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
