import {
  ChildrenProperty,
  GAP_WIDTH,
} from '@/ui/layout/expandable-list/components/ExpandableList';

export const getChildrenProperties = (
  isFocusedMode: boolean,
  availableWidth: number,
  childrenWidths: Record<number, number>,
) => {
  if (!isFocusedMode) {
    return {};
  }
  let cumulatedChildrenWidth = 0;
  const result: Record<number, ChildrenProperty> = {};
  Object.values(childrenWidths).forEach((width, index) => {
    // Because there is a 4px gap between children
    const childWidth = width + GAP_WIDTH;
    let shrink = 1;
    let isVisible = true;
    if (cumulatedChildrenWidth > availableWidth) {
      isVisible = false;
    } else if (cumulatedChildrenWidth + childWidth <= availableWidth) {
      shrink = 0;
    }
    result[index] = { shrink, isVisible };
    cumulatedChildrenWidth += childWidth;
  });
  return result;
};
