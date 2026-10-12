import { type NavigationMenuItemAddTarget } from '@/navigation-menu-item/edit/types/NavigationMenuItemAddTarget';

export type NavigationMenuItemMenuMode =
  | { type: 'actions' }
  | { type: 'edit' }
  | ({ type: 'add' } & NavigationMenuItemAddTarget);
