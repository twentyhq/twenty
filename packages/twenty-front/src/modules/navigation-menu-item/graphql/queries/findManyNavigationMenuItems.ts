import { NAVIGATION_MENU_ITEM_FRAGMENT } from '@/navigation-menu-item/graphql/fragments/navigationMenuItemFragment';
import { gql } from '@apollo/client';

export const FIND_MANY_NAVIGATION_MENU_ITEMS = gql`
  ${NAVIGATION_MENU_ITEM_FRAGMENT}
  query FindManyNavigationMenuItems {
    navigationMenuItems {
      ...NavigationMenuItemFields
    }
  }
`;
