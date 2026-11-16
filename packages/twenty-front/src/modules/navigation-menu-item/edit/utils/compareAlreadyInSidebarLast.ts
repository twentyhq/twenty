import { type NavigationMenuItemOption } from '@/navigation-menu-item/edit/types/NavigationMenuItemOption';

export const compareAlreadyInSidebarLast = (
  firstOption: NavigationMenuItemOption,
  secondOption: NavigationMenuItemOption,
) =>
  Number(firstOption.isAlreadyInSidebar) -
  Number(secondOption.isAlreadyInSidebar);
