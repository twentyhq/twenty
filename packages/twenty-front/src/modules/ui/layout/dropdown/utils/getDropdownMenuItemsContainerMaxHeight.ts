import { isDefined } from 'twenty-shared/utils';

import { DROPDOWN_MENU_ITEMS_CONTAINER_MAX_HEIGHT } from '@/ui/layout/dropdown/constants/DropdownMenuItemsContainerMaxHeight';

export const getDropdownMenuItemsContainerMaxHeight = (
  container: HTMLElement,
): number | undefined => {
  const menuItems = Array.from(
    container.querySelectorAll<HTMLElement>('[data-menu-item]'),
  ).filter(
    (menuItem) =>
      menuItem.closest('[role="listbox"]') === container &&
      menuItem.getBoundingClientRect().height > 0,
  );

  // Grids and custom content without menu rows retain the existing height cap.
  if (menuItems.length === 0) {
    return DROPDOWN_MENU_ITEMS_CONTAINER_MAX_HEIGHT;
  }

  if (menuItems.length <= 6) {
    return undefined;
  }

  const sixthItem = menuItems[5];

  if (!isDefined(sixthItem) || container.offsetWidth === 0) {
    return undefined;
  }

  const containerBounds = container.getBoundingClientRect();
  const itemBounds = sixthItem.getBoundingClientRect();
  // Bounding rectangles include the interface zoom; max-height uses CSS pixels.
  const scale = containerBounds.width / container.offsetWidth;

  return (itemBounds.top - containerBounds.top + itemBounds.height / 2) / scale;
};
